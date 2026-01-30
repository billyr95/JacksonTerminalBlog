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
    // DEBUG: Log the entire user data object
    console.log('🔍 FULL USER DATA:', JSON.stringify(evt.data, null, 2))
    
    const { id, email_addresses, phone_numbers, first_name, last_name, username } = evt.data

    // DEBUG: Log phone_numbers specifically
    console.log('📱 Phone numbers array:', phone_numbers)
    console.log('📱 Primary phone ID:', evt.data.primary_phone_number_id)

    // Extract primary email
    const primaryEmail = email_addresses?.find(email => email.id === evt.data.primary_email_address_id)
    const email = primaryEmail?.email_address

    // Extract primary phone number
    const primaryPhone = phone_numbers?.find(phone => phone.id === evt.data.primary_phone_number_id)
    const phoneNumber = primaryPhone?.phone_number

    console.log('📱 Extracted phone number:', phoneNumber)
    console.log('📱 Primary phone object:', primaryPhone)

    if (!email) {
      console.error('No email found for user:', id)
      return NextResponse.json({ error: 'No email found' }, { status: 400 })
    }

    console.log('📧 User data from Clerk:', {
      email,
      phoneNumber: phoneNumber || 'Not provided',
      firstName: first_name,
      lastName: last_name,
      username: username,
    })

    // Prepare GraphQL mutation for Laylo with phone number
    const graphqlQuery = `
      mutation($email: String, $phoneNumber: String) {
        subscribeToUser(email: $email, phoneNumber: $phoneNumber)
      }
    `

    const variables = {
      email: email,
      phoneNumber: phoneNumber || null
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
      console.log(phoneNumber 
        ? '📱 Phone number included in sync' 
        : 'ℹ️ No phone number provided by user'
      )

      return NextResponse.json({ 
        success: true, 
        message: 'User synced to Laylo',
        subscribed: layloData.data?.subscribeToUser,
        email: email,
        phoneNumber: phoneNumber || 'Not provided',
        note: phoneNumber 
          ? 'Email and phone number synced successfully' 
          : 'Email synced, no phone number provided'
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