import { GoogleGenAI } from '@google/genai';

export type ChatConfig = {
  model: string;
  temperature?: number;
  systemInstruction?: string;
};

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export class ChatService {
  private static instance: ChatService;
  private ai: GoogleGenAI;
  private chatInstances: Map<string, any> = new Map();
  
  private constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }
  
  /**
   * Get the singleton instance of ChatService
   */
  public static getInstance(apiKey: string): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService(apiKey);
    }
    return ChatService.instance;
  }
  
  /**
   * Get or create a chat instance for a specific session
   * @param sessionId - The unique identifier for the chat session
   * @param messages - The message history
   * @param config - Configuration for the chat
   * @returns The chat instance
   */
  public getChatInstance(sessionId: string, messages: ChatMessage[], config: ChatConfig): any {
    // If we already have a chat instance for this session, return it
    if (this.chatInstances.has(sessionId)) {
      return this.chatInstances.get(sessionId);
    }
    
    // Format messages for Google GenAI
    const history = messages.slice(0, -1).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }],
    }));
    
    // Create a new chat instance
    const chat = this.ai.chats.create({
      model: config.model,
      config: {
        temperature: config.temperature || 0.7,
        systemInstruction: config.systemInstruction,
      },
      history: history,
    });
    
    // Store the chat instance for future use
    this.chatInstances.set(sessionId, chat);
    
    return chat;
  }
  
  /**
   * Send a message using an existing chat instance
   * @param sessionId - The unique identifier for the chat session
   * @param message - The message to send
   * @returns The response from the AI
   */
  public async sendMessage(sessionId: string, message: string): Promise<any> {
    const chat = this.chatInstances.get(sessionId);
    if (!chat) {
      throw new Error('No chat instance found for this session');
    }
    
    return await chat.sendMessage({
      message: message,
    });
  }
  
  /**
   * Send a message and get a streaming response
   * @param sessionId - The unique identifier for the chat session
   * @param message - The message to send
   * @returns A stream of responses
   */
  public async sendMessageStream(sessionId: string, message: string): Promise<any> {
    const chat = this.chatInstances.get(sessionId);
    if (!chat) {
      throw new Error('No chat instance found for this session');
    }
    
    return await chat.sendMessageStream({
      message: message,
    });
  }
  
  /**
   * Clear a chat instance from memory
   * @param sessionId - The unique identifier for the chat session to clear
   */
  public clearChatInstance(sessionId: string): void {
    this.chatInstances.delete(sessionId);
  }
  
  /**
   * Clear all chat instances from memory
   */
  public clearAllChatInstances(): void {
    this.chatInstances.clear();
  }
}
