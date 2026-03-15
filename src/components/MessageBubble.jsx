import React from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

export const MessageBubble = ({ message, onSpeak }) => {
  const { speak, isSpeaking } = useTextToSpeech();
  const isUser = message.sender === 'user';

  const handleSpeak = () => {
    if (message.type === 'text' && message.content) {
      speak(message.content);
    }
  };

  const bubbleVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  if (message.type === 'loading') {
    return (
      <motion.div
        initial="initial"
        animate="animate"
        variants={bubbleVariants}
        className="flex justify-start mb-4"
      >
        <div className="max-w-[70%] lg:max-w-[60%]">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl rounded-tl-none p-4 border border-white/20">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (message.type === 'image') {
    return (
      <motion.div
        initial="initial"
        animate="animate"
        variants={bubbleVariants}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className="max-w-[70%] lg:max-w-[60%]">
          <div className={`rounded-2xl overflow-hidden border ${
            isUser 
              ? 'bg-blue-500/20 backdrop-blur-md border-blue-400/30 rounded-tr-none' 
              : 'bg-white/10 backdrop-blur-md border-white/20 rounded-tl-none'
          }`}>
            {message.loading ? (
              <div className="p-4">
                <div className="animate-pulse">
                  <div className="h-48 bg-white/10 rounded-lg mb-2"></div>
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                </div>
              </div>
            ) : (
              <div className="p-2">
                <img 
                  src={message.imageUrl} 
                  alt={message.prompt}
                  className="w-full rounded-lg"
                />
                {message.prompt && (
                  <p className="text-white/80 text-sm mt-2 px-2 pb-1">
                    {message.prompt}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={bubbleVariants}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className="max-w-[70%] lg:max-w-[60%] group">
        <div className={`relative rounded-2xl px-4 py-3 ${
          isUser 
            ? 'bg-blue-500/20 backdrop-blur-md border border-blue-400/30 rounded-tr-none' 
            : 'bg-white/10 backdrop-blur-md border border-white/20 rounded-tl-none'
        }`}>
          <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
          
          {!isUser && message.type === 'text' && (
            <button
              onClick={handleSpeak}
              disabled={isSpeaking}
              className="absolute -right-2 -bottom-2 bg-white/20 backdrop-blur-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white/30 disabled:opacity-50"
              title="Read message"
            >
              <Volume2 size={14} className="text-white/80" />
            </button>
          )}
        </div>
        
        <div className={`text-xs text-white/50 mt-1 ${
          isUser ? 'text-right' : 'text-left'
        }`}>
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </motion.div>
  );
};
