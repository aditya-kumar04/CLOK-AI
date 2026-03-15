import React from 'react';
import { ClokAI } from './components/ClokAI';

function App() {
  const handleSendMessage = async (message) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (message.toLowerCase().includes('hello')) {
      return {
        type: 'text',
        content: 'Hello! How can I assist you today? I\'m here to help with any questions or tasks you might have.'
      };
    } else if (message.toLowerCase().includes('help')) {
      return {
        type: 'text',
        content: 'I can help you with:\n• Writing and editing\n• Problem solving\n• Creative ideas\n• Code assistance\n• And much more!\n\nWhat would you like to work on?'
      };
    } else {
      return {
        type: 'text',
        content: `That\'s an interesting message! You said: "${message}".\n\nI can help you explore this topic further, answer questions, provide information, or assist with any tasks you have in mind. What specific aspect would you like to dive into?`
      };
    }
  };

  return (
    <div style={{ height: '100vh', overflow: 'hidden' }}>
      <ClokAI 
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}

export default App;
