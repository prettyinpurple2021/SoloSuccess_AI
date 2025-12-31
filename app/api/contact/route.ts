
import { NextRequest, NextResponse } from 'next/server'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils'
import { logInfo, logError } from '@/lib/logger'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, type = 'demo_request' } = body

    if (!name || !email) {
      return createErrorResponse('Name and email are required', 400)
    }

    // In a real implementation, this would send an email via Resend/SendGrid
    // or store in a CRM like HubSpot/Salesforce.
    // For now, we log it securely as a "processed" request.
    
    logInfo('Contact request received:', { 
      type, 
      name, 
      email: email.replace(/(?<=.{3}).(?=.*@)/g, '*') // mask email for logs
    })

    return createSuccessResponse(
      { success: true },
      'Request submitted successfully'
    )

  } catch (error) {
    logError('Contact API error:', error)
    return createErrorResponse('Failed to submit request', 500)
  }
}
