# AI Multi-Chat Platform

A Next.js 15 application that provides AI chat functionality with proper loading states and text streaming.

## Features

- Multiple chat sessions with branching capability
- Real-time text streaming from AI responses
- Visual loading states for better user experience
- Configurable AI agent settings (model, temperature, system instructions)
- Google Gemini AI integration

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- Google Gemini API key (get one from [Google AI Studio](https://aistudio.google.com/app/apikey))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-multi-chat-platform.git
cd ai-multi-chat-platform
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create a `.env.local` file in the root directory and add your Google API key:
```
GOOGLE_API_KEY=your_google_api_key_here
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key_here
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

- **Start a conversation**: Type your message in the input field and click "Send"
- **Configure AI agent**: Click the settings icon to configure the AI agent (model, temperature, system instructions)
- **Branch a conversation**: Click the split icon to create a new branch from the current conversation
- **Switch between conversations**: Use the visual chat tree in the sidebar to navigate between different chat sessions

## Technologies Used

- Next.js 15
- React
- TypeScript
- Zustand (for state management)
- Google Gemini AI API
- Tailwind CSS
- shadcn/ui components

## Project Structure

- `/app`: Next.js app router files
- `/components`: React components
- `/lib`: Utility functions and services
- `/store`: Zustand store for state management
- `/public`: Static assets

## License

This project is licensed under the MIT License - see the LICENSE file for details.
