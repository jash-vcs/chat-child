import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export type AgentConfig = {
  id: string;
  name: string;
  systemInstruction: string;
  model: string;
  temperature: number;
};

export type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  isLoading?: boolean;
  isStreaming?: boolean;
};

export type ChatSession = {
  id: string;
  parentId: string | null;
  agentConfig: AgentConfig;
  messages: Message[];
  children: string[];
};

type ChatStore = {
  sessions: Record<string, ChatSession>;
  activeSessionId: string;
  setActiveSessionId: (id: string) => void;
  createSession: (parentId?: string) => string;
  updateAgentConfig: (sessionId: string, config: Partial<AgentConfig>) => void;
  addMessage: (sessionId: string, message: Omit<Message, 'id' | 'timestamp'>) => string;
  updateMessage: (sessionId: string, messageId: string, updates: Partial<Message>) => void;
  appendToMessage: (sessionId: string, messageId: string, content: string) => void;
  splitChat: (sessionId: string) => string;
};

const defaultAgentConfig: AgentConfig = {
  id: uuidv4(),
  name: 'AI Assistant',
  systemInstruction: 'You are a helpful AI assistant.',
  model: 'gemini-2.0-flash',
  temperature: 0.7,
};

export const useChatStore = create<ChatStore>((set, get) => {
  // Initialize with a root session
  const rootId = uuidv4();
  const initialSessions = {
    [rootId]: {
      id: rootId,
      parentId: null,
      agentConfig: { ...defaultAgentConfig, id: uuidv4() },
      messages: [],
      children: [],
    },
  };

  return {
    sessions: initialSessions,
    activeSessionId: rootId,
    
    setActiveSessionId: (id) => set({ activeSessionId: id }),
    
    createSession: (parentId) => {
      const newSessionId = uuidv4();
      const newAgentId = uuidv4();
      
      set((state) => {
        const newSessions = { ...state.sessions };
        
        // Create new session
        newSessions[newSessionId] = {
          id: newSessionId,
          parentId: parentId || null,
          agentConfig: {
            ...defaultAgentConfig,
            id: newAgentId,
            name: parentId ? `Branch of ${state.sessions[parentId].agentConfig.name}` : 'New Chat',
          },
          messages: parentId ? [...state.sessions[parentId].messages] : [],
          children: [],
        };
        
        // Update parent's children if there is a parent
        if (parentId) {
          newSessions[parentId] = {
            ...newSessions[parentId],
            children: [...newSessions[parentId].children, newSessionId],
          };
        }
        
        return { sessions: newSessions };
      });
      
      return newSessionId;
    },
    
    updateAgentConfig: (sessionId, config) => {
      set((state) => ({
        sessions: {
          ...state.sessions,
          [sessionId]: {
            ...state.sessions[sessionId],
            agentConfig: {
              ...state.sessions[sessionId].agentConfig,
              ...config,
            },
          },
        },
      }));
    },
    
    addMessage: (sessionId, message) => {
      const messageId = uuidv4();
      const newMessage: Message = {
        ...message,
        id: messageId,
        timestamp: new Date(),
      };
      
      set((state) => ({
        sessions: {
          ...state.sessions,
          [sessionId]: {
            ...state.sessions[sessionId],
            messages: [...state.sessions[sessionId].messages, newMessage],
          },
        },
      }));
      
      return messageId;
    },
    
    updateMessage: (sessionId, messageId, updates) => {
      set((state) => {
        const session = state.sessions[sessionId];
        const messageIndex = session.messages.findIndex((m) => m.id === messageId);
        
        if (messageIndex === -1) return state;
        
        const updatedMessages = [...session.messages];
        updatedMessages[messageIndex] = {
          ...updatedMessages[messageIndex],
          ...updates,
        };
        
        return {
          sessions: {
            ...state.sessions,
            [sessionId]: {
              ...session,
              messages: updatedMessages,
            },
          },
        };
      });
    },
    
    appendToMessage: (sessionId, messageId, content) => {
      set((state) => {
        const session = state.sessions[sessionId];
        const messageIndex = session.messages.findIndex((m) => m.id === messageId);
        
        if (messageIndex === -1) return state;
        
        const updatedMessages = [...session.messages];
        updatedMessages[messageIndex] = {
          ...updatedMessages[messageIndex],
          content: updatedMessages[messageIndex].content + content,
        };
        
        return {
          sessions: {
            ...state.sessions,
            [sessionId]: {
              ...session,
              messages: updatedMessages,
            },
          },
        };
      });
    },
    
    splitChat: (sessionId) => {
      return get().createSession(sessionId);
    },
  };
});
