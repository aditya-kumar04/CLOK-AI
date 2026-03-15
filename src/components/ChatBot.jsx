import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Image } from 'lucide-react';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { MessageBubble } from './MessageBubble';

export const ChatBot = ({ 
  initialMessages = [],
  onSendMessage = async (message) => {
    // Mock response - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      type: 'text',
      content: `You said: "${message}"`,
      sender: 'bot'
    };
  }
}) => {
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const {
    isListening,
    transcript,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: speechSupported
  } = useSpeechToText();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  const handleSendMessage = async (content) => {
    if (!content.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'text',
      content: content.trim(),
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    resetTranscript();
    setIsTyping(true);

    try {
      // Check if it's an image generation command
      if (content.startsWith('/generate ')) {
        const prompt = content.replace('/generate ', '').trim();
        
        // Add loading message
        const loadingMessage = {
          id: Date.now() + 1,
          type: 'image',
          prompt,
          loading: true,
          sender: 'bot',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, loadingMessage]);

        // Mock image generation
        setTimeout(() => {
          setMessages(prev => prev.map(msg => 
            msg.id === loadingMessage.id 
              ? {
                  ...msg,
                  loading: false,
                  imageUrl: `https://picsum.photos/seed/${encodeURIComponent(prompt)}/400/300.jpg`
                }
              : msg
          ));
        }, 2000);
      } else {
        // Regular text message
        const response = await onSendMessage(content);
        const botMessage = {
          id: Date.now() + 1,
          type: response.type || 'text',
          content: response.content,
          sender: 'bot',
          timestamp: new Date().toISOString(),
          ...response
        };

        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'text',
        content: 'Sorry, something went wrong. Please try again.',
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const containerVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={containerVariants}
      className="w-full h-[600px] max-w-4xl mx-auto bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <h2 className="text-white font-medium">AI Assistant</h2>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <MessageBubble
            message={{
              id: 'typing',
              type: 'loading',
              sender: 'bot'
            }}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Speech Error */}
      {speechError && (
        <div className="px-4 pb-2">
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg px-3 py-2">
            <p className="text-red-200 text-xs">Speech error: {speechError}</p>
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="bg-white/10 backdrop-blur-md border-t border-white/20 px-4 py-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message... (use /generate for images)"
              className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 pr-12 text-white placeholder-white/50 resize-none focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-200"
              rows={1}
              style={{
                minHeight: '48px',
                maxHeight: '120px'
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
            
            {/* Character count for image generation */}
            {inputText.startsWith('/generate ') && (
              <div className="absolute -top-6 left-0 text-xs text-white/60">
                Image generation mode
              </div>
            )}
          </div>

          {/* Microphone Button */}
          {speechSupported && (
            <button
              type="button"
              onClick={handleMicToggle}
              className={`p-3 rounded-full transition-all duration-200 ${
                isListening 
                  ? 'bg-red-500/20 border border-red-400/50 text-red-300 animate-pulse' 
                  : 'bg-white/10 border border-white/20 text-white/70 hover:bg-white/20 hover:text-white'
              }`}
              title={isListening ? 'Stop recording' : 'Start voice input'}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="p-3 bg-blue-500/20 border border-blue-400/50 text-blue-300 rounded-full hover:bg-blue-500/30 hover:border-blue-400/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            title="Send message"
          >
            <Send size={18} />
          </button>
        </form>

        {/* Help Text */}
        <div className="mt-2 text-xs text-white/50 text-center">
          Try: "/generate a sunset over mountains" or use voice input
        </div>
      </div>
    </motion.div>
  );
};
