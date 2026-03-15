# AI Chatbot Component

A modular, high-performance chatbot component built with React, Vite, and modern web technologies.

## Features

- 🎤 **Speech-to-Text**: Voice input using Web Speech API
- 🔊 **Text-to-Speech**: Audio playback for bot messages
- 🖼️ **Image Generation UI**: Support for image generation commands
- 🎨 **Glassmorphism Design**: Clean, modern Apple-style aesthetic
- 📱 **Responsive**: Mobile-friendly design
- ⚡ **High Performance**: Optimized with Framer Motion animations

## Tech Stack

- **React 18** with Vite
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **Web Speech API** for speech functionality

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Usage

### Basic Integration

```jsx
import { ChatBot } from './components/ChatBot';

function App() {
  const initialMessages = [
    {
      id: 1,
      type: 'text',
      content: 'Hello! How can I help you?',
      sender: 'bot',
      timestamp: new Date().toISOString()
    }
  ];

  const handleSendMessage = async (message) => {
    // Replace with your actual API call
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    
    return await response.json();
  };

  return (
    <ChatBot 
      initialMessages={initialMessages}
      onSendMessage={handleSendMessage}
    />
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialMessages` | `Array` | `[]` | Initial chat messages |
| `onSendMessage` | `Function` | Mock function | Function to handle message sending |

### Message Format

```javascript
{
  id: Number,
  type: 'text' | 'image' | 'loading',
  content: String, // for text messages
  prompt: String, // for image generation
  imageUrl: String, // for generated images
  loading: Boolean, // for loading state
  sender: 'user' | 'bot',
  timestamp: String // ISO string
}
```

## Commands

### Text Messages
Simply type your message and press Enter or click the send button.

### Voice Input
Click the microphone button to start voice recording. Click again to stop.

### Image Generation
Use the `/generate` command:
```
/generate a sunset over mountains
/generate abstract art with blue colors
```

## Custom Hooks

### useSpeechToText
```jsx
import { useSpeechToText } from './hooks/useSpeechToText';

const {
  isListening,
  transcript,
  error,
  startListening,
  stopListening,
  resetTranscript,
  isSupported
} = useSpeechToText();
```

### useTextToSpeech
```jsx
import { useTextToSpeech } from './hooks/useTextToSpeech';

const {
  isSpeaking,
  error,
  speak,
  stop,
  pause,
  resume,
  getVoices,
  isSupported
} = useTextToSpeech();
```

## Tailwind Configuration

The component uses custom Tailwind configuration. Make sure your `tailwind.config.js` includes:

```javascript
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        glass: {
          bg: 'rgba(255, 255, 255, 0.1)',
          border: 'rgba(255, 255, 255, 0.2)',
          text: 'rgba(255, 255, 255, 0.9)',
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
```

## Browser Support

- **Speech-to-Text**: Requires Chrome, Edge, or Safari
- **Text-to-Speech**: Supported in all modern browsers
- **Fallback**: Graceful degradation when speech APIs are unavailable

## Customization

### Styling
The component uses Tailwind CSS classes. Modify the classes in `ChatBot.jsx` and `MessageBubble.jsx` to match your design system.

### API Integration
Replace the mock `handleSendMessage` function with your actual API call:

```javascript
const handleSendMessage = async (message) => {
  try {
    const response = await fetch('/your-api-endpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-token'
      },
      body: JSON.stringify({ message })
    });
    
    const data = await response.json();
    return {
      type: 'text',
      content: data.response,
      sender: 'bot'
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      type: 'text',
      content: 'Sorry, I encountered an error.',
      sender: 'bot'
    };
  }
};
```

## File Structure

```
src/
├── components/
│   ├── ChatBot.jsx          # Main chatbot component
│   └── MessageBubble.jsx    # Message bubble component
├── hooks/
│   ├── useSpeechToText.js   # Speech-to-text hook
│   └── useTextToSpeech.js   # Text-to-speech hook
└── App.jsx                  # Demo application
```

## Performance Optimizations

- **Auto-scroll**: Smooth scrolling to latest messages
- **Message virtualization**: Consider for large chat histories
- **Debounced input**: Prevents excessive API calls
- **Lazy loading**: Images load only when visible
- **Animation optimization**: Hardware-accelerated animations

## License

MIT License - feel free to use in your projects!
