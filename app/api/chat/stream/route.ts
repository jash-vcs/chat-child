import { NextRequest } from 'next/server';
import { ChatService } from '@/services/chat-service';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { messages, config, sessionId } = await req.json();

    // Validate request
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid messages format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!config || !config.model) {
      return new Response(JSON.stringify({ error: 'Invalid configuration' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Session ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize ChatService
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const chatService = ChatService.getInstance(apiKey);

    // Get the latest message
    const latestMessage = messages[messages.length - 1];

    // Get or create chat instance for this session
    chatService.getChatInstance(sessionId, messages.slice(0, -1), config);

    // Create a streaming response
    const stream = await chatService.sendMessageStream(sessionId, latestMessage.content);

    // Set up the response stream
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in streaming chat API:', error);
    return new Response(JSON.stringify({ error: 'Failed to process streaming chat request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
