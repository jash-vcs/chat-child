import { GoogleGenAI } from '@google/genai';

// Initialize the Google GenAI client
const getAIClient = () => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('Google API key is not defined in environment variables');
  }
  return new GoogleGenAI({ apiKey });
};

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type ChatOptions = {
  model: string;
  temperature: number;
  systemInstruction?: string;
};

export async function sendChatMessage(
  messages: ChatMessage[],
  options: ChatOptions
): Promise<string> {
  try {
    const ai = getAIClient();
    
    // Format messages for Google GenAI
    const history = messages.slice(0, -1).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }],
    }));
    
    // Get the latest message
    const latestMessage = messages[messages.length - 1];
    
    // Create chat instance
    const chat = ai.chats.create({
      model: options.model,
      temperature: options.temperature,
      history: history,
    });
    
    // Send message and get response
    const response = await chat.sendMessage({
      message: latestMessage.content,
    });
    
    return response.text();
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}

export async function streamChatMessage(
  messages: ChatMessage[],
  options: ChatOptions,
  onChunk: (chunk: string) => void
): Promise<string> {
  try {
    const ai = getAIClient();
    
    // Format messages for Google GenAI
    const history = messages.slice(0, -1).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }],
    }));
    
    // Get the latest message
    const latestMessage = messages[messages.length - 1];
    
    // Create chat instance
    const chat = ai.chats.create({
      model: options.model,
      temperature: options.temperature,
      history: history,
    });
    
    // Send message and get streaming response
    const stream = await chat.sendMessageStream({
      message: latestMessage.content,
    });
    
    let fullResponse = '';
    
    // Process each chunk
    for await (const chunk of stream) {
      const chunkText = chunk.text;
      fullResponse += chunkText;
      onChunk(chunkText);
    }
    
    return fullResponse;
  } catch (error) {
    console.error('Error streaming chat message:', error);
    throw error;
  }
}
