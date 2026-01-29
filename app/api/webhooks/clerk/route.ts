import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  // Get the Svix headers for verification
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '')

  let evt: WebhookEvent

  // Verify the webhook
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error: Verification failed', {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, username } = evt.data

    // Extract primary email
    const primaryEmail = email_addresses?.find(email => email.id === evt.data.primary_email_address_id)
    const email = primaryEmail?.email_address

    if (!email) {
      console.error('No email found for user:', id)
      return NextResponse.json({ error: 'No email found' }, { status: 400 })
    }

    console.log('📧 User data from Clerk:', {
      email,
      firstName: first_name,
      lastName: last_name,
      username: username,
    })

    // Prepare GraphQL mutation for Laylo - email only since firstName/lastName aren't supported
    const graphqlQuery = `
      mutation($email: String) {
        subscribeToUser(email: $email)
      }
    `

    const variables = {
      email: email
    }

    console.log('🔄 Syncing to Laylo with:', variables)

    // Send to Laylo using GraphQL
    try {
      const layloResponse = await fetch('https://laylo.com/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LAYLO_API_KEY}`,
        },
        body: JSON.stringify({
          query: graphqlQuery,
          variables: variables
        }),
      })

      if (!layloResponse.ok) {
        const errorText = await layloResponse.text()
        console.error('Laylo API error:', errorText)
        throw new Error(`Laylo API returned ${layloResponse.status}`)
      }

      const layloData = await layloResponse.json()
      
      // Check if GraphQL returned errors
      if (layloData.errors) {
        console.error('Laylo GraphQL errors:', layloData.errors)
        throw new Error(`Laylo GraphQL error: ${JSON.stringify(layloData.errors)}`)
      }

      console.log('✅ Successfully synced to Laylo:', layloData)
      console.log('ℹ️ Note: firstName and lastName collected in Clerk but not sent to Laylo (API limitation)')

      return NextResponse.json({ 
        success: true, 
        message: 'User synced to Laylo',
        subscribed: layloData.data?.subscribeToUser,
        email: email,
        note: 'firstName and lastName collected but not synced (Laylo API limitation)'
      })

    } catch (error) {
      console.error('Error syncing to Laylo:', error)
      return NextResponse.json({ 
        error: 'Failed to sync to Laylo',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
  }

  return NextResponse.json({ message: 'Webhook received' })
}