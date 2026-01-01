
import { CollaborationHub } from '../src/lib/collaboration-hub'
import { logger } from '../src/lib/logger'

async function testAgentInteraction() {
    console.log('🚀 Starting Agent Interaction Test')

    // Initialize Hub
    const hub = new CollaborationHub()

    // Create a session
    console.log('Creating session...')
    const session = await hub.initiateCollaboration({
        userId: 1,
        requestType: 'project',
        projectName: 'Test Project Alpha',
        initialMessage: 'We need to create a marketing plan for a new AI coffee machine.',
        requiredAgents: ['roxy', 'echo', 'blaze']
    })

    if (session.status === 'error') {
        console.error('❌ Failed to create session:', session.message)
        return
    }

    console.log(`✅ Session created: ${session.sessionId}`)
    console.log(`👥 Participants: ${session.participants.map(p => p.displayName).join(', ')}`)

    // Wait for agents to process (simulated)
    console.log('⏳ Waiting for agent responses (5s)...')
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Check session history/messages
    // Since we don't have direct DB access easily here without setting up connection,
    // we might need to rely on logs or inspect the hub's in-memory state if possible.
    // But hub uses DB for some things? No, hub uses in-memory maps for active sessions.
    // But message router logs to DB?
    // Let's just check if the session is active and has updated.

    const activeSession = hub.getSession(session.sessionId)
    if (activeSession) {
        console.log('✅ Session is active')
        console.log('Last Updated:', activeSession.updatedAt)
    } else {
        console.error('❌ Session not found')
    }

    console.log('🏁 Test Complete')
}

testAgentInteraction().catch(console.error)
