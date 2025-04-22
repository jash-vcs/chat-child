import { NextRequest, NextResponse } from 'next/server';
import { ChatService } from '@/services/chat-service';

export async function POST(req: NextRequest) {
  try {
    const { messages, config, sessionId } = await req.json();

    // Validate request
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    if (!config || !config.model) {
      return NextResponse.json({ error: 'Invalid configuration' }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Initialize ChatService
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const chatService = ChatService.getInstance(apiKey);

    // Get the latest message
    const latestMessage = messages[messages.length - 1];

    // Get or create chat instance for this session
    chatService.getChatInstance(sessionId, messages.slice(0, -1), config);

    // Send message and get response
    const response = await chatService.sendMessage(sessionId, latestMessage.content);

    return NextResponse.json({ response: response.text });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'Failed to process chat request' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Chat API is running' });
}
