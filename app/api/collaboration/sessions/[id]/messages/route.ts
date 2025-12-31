
import { NextRequest, NextResponse } from 'next/server'
import { withDocumentAuth, getSql, createErrorResponse } from '@/lib/api-utils'
import { logInfo, logError } from '@/lib/logger'

export const GET = withDocumentAuth(
  async (request: NextRequest, user: any, documentId: string) => {
    // documentId is the sessionId from the URL param
    const sessionId = documentId

    try {
      const sql = getSql()
      
      const messages = await sql`
        SELECT m.*, 
               u.name as sender_name,
               u.image as sender_avatar
        FROM collaboration_messages m
        LEFT JOIN users u ON m.sender_id = u.id
        WHERE m.session_id = ${sessionId}
        AND m.is_deleted = false
        ORDER BY m.created_at ASC
        LIMIT 100
      `

      // Transform to matching frontend interface
      const formattedMessages = messages.map((m: any) => ({
        id: m.id,
        content: m.content,
        senderId: m.sender_id,
        senderName: m.sender_type === 'agent' ? m.sender_id : (m.sender_name || 'User'),
        senderType: m.sender_type,
        timestamp: m.created_at,
        type: m.type,
        status: 'delivered',
        metadata: m.metadata || {}
      }))

      return NextResponse.json({ 
        success: true, 
        data: { messages: formattedMessages } 
      })

    } catch (error) {
      logError('Error fetching messages:', error)
      return createErrorResponse('Failed to fetch messages', 500)
    }
  }
)

export const POST = withDocumentAuth(
  async (request: NextRequest, user: any, documentId: string) => {
    const sessionId = documentId

    try {
      const body = await request.json()
      const { content, type, metadata, priority } = body

      if (!content) {
        return createErrorResponse('Content is required', 400)
      }

      const sql = getSql()

      const [newMessage] = await sql`
        INSERT INTO collaboration_messages (
          session_id, 
          sender_id, 
          sender_type, 
          content, 
          type, 
          metadata
        )
        VALUES (
          ${sessionId}, 
          ${user.id}, 
          'user', 
          ${content}, 
          ${type || 'text'}, 
          ${JSON.stringify({ ...metadata, priority } || {})}
        )
        RETURNING *
      ` as any[]

      // Update session last activity
      await sql`
        UPDATE collaboration_sessions 
        SET last_activity_at = NOW() 
        WHERE id = ${sessionId}
      `

      const formattedMessage = {
        id: newMessage.id,
        content: newMessage.content,
        senderId: newMessage.sender_id,
        senderName: user.name || 'You',
        senderType: 'user',
        timestamp: newMessage.created_at,
        type: newMessage.type,
        status: 'sent',
        metadata: newMessage.metadata || {}
      }

      return NextResponse.json({ 
        success: true, 
        data: { message: formattedMessage } 
      })

    } catch (error) {
      logError('Error sending message:', error)
      return createErrorResponse('Failed to send message', 500)
    }
  }
)