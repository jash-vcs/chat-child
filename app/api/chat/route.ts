import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { messages, config } = await req.json();
    
    // Validate request
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }
    
    if (!config || !config.model) {
      return NextResponse.json({ error: 'Invalid configuration' }, { status: 400 });
    }
    
    // Initialize Google GenAI
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }
    
    const ai = new GoogleGenAI({ apiKey });
    
    // Format messages for Google GenAI
    const history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }],
    }));
    
    // Get the latest message
    const latestMessage = messages[messages.length - 1];
    
    // Create chat instance
    const chat = ai.chats.create({
      model: config.model,
      temperature: config.temperature || 0.7,
      history: history,
    });
    
    // Send message and get response
    const response = await chat.sendMessage({
      message: latestMessage.content,
    });
    
    return NextResponse.json({ response: response.text() });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'Failed to process chat request' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Chat API is running' });
}
