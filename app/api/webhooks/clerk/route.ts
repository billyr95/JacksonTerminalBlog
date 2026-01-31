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
    const { id, email_addresses, phone_numbers, first_name, last_name, username } = evt.data

    // Extract primary email
    const primaryEmail = email_addresses?.find(email => email.id === evt.data.primary_email_address_id)
    const email = primaryEmail?.email_address

    // Extract phone number - try primary first, then fall back to first available
    let phoneNumber = null
    
    if (evt.data.primary_phone_number_id) {
      // Try to find by primary ID
      const primaryPhone = phone_numbers?.find(phone => phone.id === evt.data.primary_phone_number_id)
      phoneNumber = primaryPhone?.phone_number
    }
    
    // If no primary or primary not found, use the first phone number
    if (!phoneNumber && phone_numbers && phone_numbers.length > 0) {
      phoneNumber = phone_numbers[0].phone_number
    }

    console.log('📱 Phone numbers array:', phone_numbers)
    console.log('📱 Primary phone ID:', evt.data.primary_phone_number_id)
    console.log('📱 Extracted phone number:', phoneNumber)

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

    // GraphQL mutation - single identifier only
    const graphqlQuery = `
      mutation($email: String, $phoneNumber: String) {
        subscribeToUser(email: $email, phoneNumber: $phoneNumber)
      }
    `

    const results = {
      email: { success: false, data: null as any },
      phone: { success: false, data: null as any }
    }

    // FIRST CALL: Subscribe with email
    try {
      console.log('🔄 Call 1: Syncing email to Laylo:', email)
      
      const emailResponse = await fetch('https://laylo.com/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LAYLO_API_KEY}`,
        },
        body: JSON.stringify({
          query: graphqlQuery,
          variables: { email: email, phoneNumber: null }
        }),
      })

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text()
        console.error('Laylo email API error:', errorText)
        throw new Error(`Laylo API returned ${emailResponse.status}`)
      }

      const emailData = await emailResponse.json()
      
      if (emailData.errors) {
        console.error('Laylo email GraphQL errors:', emailData.errors)
        throw new Error(`Laylo GraphQL error: ${JSON.stringify(emailData.errors)}`)
      }

      console.log('✅ Email successfully synced to Laylo')
      results.email.success = true
      results.email.data = emailData

    } catch (error) {
      console.error('❌ Error syncing email to Laylo:', error)
      // Continue to try phone even if email fails
    }

    // SECOND CALL: Subscribe with phone number (if available)
    if (phoneNumber) {
      try {
        console.log('🔄 Call 2: Syncing phone to Laylo:', phoneNumber)
        
        const phoneResponse = await fetch('https://laylo.com/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.LAYLO_API_KEY}`,
          },
          body: JSON.stringify({
            query: graphqlQuery,
            variables: { email: null, phoneNumber: phoneNumber }
          }),
        })

        if (!phoneResponse.ok) {
          const errorText = await phoneResponse.text()
          console.error('Laylo phone API error:', errorText)
          throw new Error(`Laylo API returned ${phoneResponse.status}`)
        }

        const phoneData = await phoneResponse.json()
        
        if (phoneData.errors) {
          console.error('Laylo phone GraphQL errors:', phoneData.errors)
          throw new Error(`Laylo GraphQL error: ${JSON.stringify(phoneData.errors)}`)
        }

        console.log('✅ Phone successfully synced to Laylo')
        results.phone.success = true
        results.phone.data = phoneData

      } catch (error) {
        console.error('❌ Error syncing phone to Laylo:', error)
      }
    } else {
      console.log('ℹ️ No phone number to sync')
    }

    // Return success if at least email succeeded
    if (results.email.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'User synced to Laylo',
        email: {
          synced: true,
          value: email
        },
        phone: {
          synced: results.phone.success,
          value: phoneNumber || 'Not provided'
        }
      })
    } else {
      return NextResponse.json({ 
        error: 'Failed to sync to Laylo',
        details: 'Email sync failed'
      }, { status: 500 })
    }
  }

  return NextResponse.json({ message: 'Webhook received' })
}