import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, MessageSquare, Bot, User, Plus, Menu, ChevronDown, Settings } from 'lucide-react';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { clokService } from '../services/clokService';

export const ClokAI = ({ 
  onSendMessage = async (message) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      type: 'text',
      content: `I received your message: "${message}". This is a mock response - replace with your actual API call.`,
      sender: 'assistant'
    };
  }
}) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [currentModel, setCurrentModel] = useState('auto');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const modelDropdownRef = useRef(null);

  const {
    isListening,
    transcript,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: speechSupported
  } = useSpeechToText();

  const { speak, isSpeaking } = useTextToSpeech();

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target)) {
        setShowModelDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Model selection handler
  const handleModelSelect = (model) => {
    setCurrentModel(model);
    clokService.currentModel = model;
    setShowModelDropdown(false);
  };

  // Get model display name
  const getModelDisplayName = (model) => {
    const modelNames = {
      'auto': 'Auto Select',
      'groq': 'Groq',
      'gemini': 'Gemini',
      'llama-3.1-8b-instant': 'Llama 3.1 (Fast)',
      'llama-3.1-70b-versatile': 'Llama 3.1 (Smart)',
      'mixtral-8x7b-32768': 'Mixtral',
      'gemma2-9b-it': 'Gemma 2',
      'gemini-1.5-flash': 'Gemini 1.5 Flash'
      // Updated to SDK model name
    };
    return modelNames[model] || model;
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputText]);

  const handleSendMessage = async (content) => {
    console.log('=== CLOKAI COMPONENT DEBUG ===');
    console.log('Content:', content);
    console.log('onSendMessage prop:', typeof onSendMessage);
    console.log('onSendMessage function:', !!onSendMessage);
    
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
    setIsTyping(true);

    try {
      console.log('Calling onSendMessage from component...');
      const response = await onSendMessage(content);
      console.log('Response received in component:', response);
      
      const assistantMessage = {
        id: Date.now() + 1,
        type: response.type || 'text',
        content: response.content || 'No response received',
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        ...(response.imageUrl && { imageUrl: response.imageUrl }),
        ...(response.prompt && { prompt: response.prompt })
      };

      setMessages(prev => [...prev, assistantMessage]);
      console.log('=== CLOKAI COMPONENT DEBUG END ===');
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'text',
        content: 'Sorry, there was an error processing your message.',
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        isError: true
      }]);
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

  const handleNewChat = () => {
    setMessages([]);
    setInputText('');
    resetTranscript();
  };

  const handleSpeak = (content) => {
    if (content) {
      speak(content);
    }
  };

  const conversations = [
    { id: 1, title: 'Design System Discussion', subtitle: '12 messages', time: '2 hours ago', active: false },
    { id: 2, title: 'React Architecture', subtitle: '8 messages', time: 'Yesterday', active: false },
    { id: 3, title: 'UI/UX Review', subtitle: '15 messages', time: '2 days ago', active: true },
    { id: 4, title: 'Performance Optimization', subtitle: '6 messages', time: '3 days ago', active: false },
  ];

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: '260px', background: '#f0f0f0', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e0e0e0' }}>
          <button 
            onClick={handleNewChat}
            style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              padding: '12px 16px', 
              background: '#f8f9fa', 
              border: '1px solid #e9ecef', 
              borderRadius: '8px', 
              color: '#495057', 
              fontSize: '14px', 
              fontWeight: '500', 
              cursor: 'pointer', 
              transition: 'all 0.2s ease' 
            }}
          >
            <Plus size={18} />
            <span>New Chat</span>
          </button>
        </div>

        <div style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
          {conversations.map((conv) => (
            <div
              key={conv.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 16px',
                marginBottom: '4px',
                color: '#495057',
                cursor: 'pointer',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                background: conv.active ? '#e3f2fd' : 'transparent',
                color: conv.active ? '#1971c2' : '#495057'
              }}
            >
              <MessageSquare size={18} style={{ marginTop: '2px', opacity: 0.7, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px', lineHeight: '1.3' }}>{conv.title}</div>
                <div style={{ fontSize: '12px', opacity: 0.6, lineHeight: '1.2' }}>{conv.subtitle} • {conv.time}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid #e0e0e0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#495057', cursor: 'pointer', borderRadius: '8px', transition: 'all 0.2s ease' }}>
            <div style={{ width: '32px', height: '32px', background: '#6c757d', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={18} style={{ color: '#fff' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '2px' }}>John Doe</div>
              <div style={{ fontSize: '12px', opacity: 0.6 }}>Free Plan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
        {/* Header */}
        <div style={{ background: '#f8f9fa', borderBottom: '1px solid #e9ecef', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', height: '56px' }}>
          <div style={{ cursor: 'pointer' }}>
            <Menu size={18} style={{ color: '#495057' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', background: '#007bff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={18} style={{ color: '#fff' }} />
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#212529' }}>Clok AI</div>
          </div>
          
          {/* Model Selection Dropdown */}
          <div style={{ marginLeft: 'auto', position: 'relative' }} ref={modelDropdownRef}>
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: '#ffffff',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#495057',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                ':hover': {
                  background: '#f8f9fa',
                  borderColor: '#007bff'
                }
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f8f9fa';
                e.target.style.borderColor = '#007bff';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#ffffff';
                e.target.style.borderColor = '#dee2e6';
              }}
            >
              <Settings size={14} />
              <span>{getModelDisplayName(currentModel)}</span>
              <ChevronDown size={14} style={{ 
                transition: 'transform 0.2s ease',
                transform: showModelDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
              }} />
            </button>
            
            {showModelDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                marginTop: '8px',
                background: '#ffffff',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                zIndex: 1000,
                minWidth: '200px',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {/* Auto Selection */}
                <div
                  onClick={() => handleModelSelect('auto')}
                  style={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f1f3f4',
                    fontSize: '14px',
                    color: currentModel === 'auto' ? '#007bff' : '#495057',
                    background: currentModel === 'auto' ? '#f8f9ff' : 'transparent',
                    ':hover': {
                      background: '#f8f9fa'
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = currentModel === 'auto' ? '#f8f9ff' : '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = currentModel === 'auto' ? '#f8f9ff' : 'transparent';
                  }}
                >
                  🔄 Auto Select
                  <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '2px' }}>
                    Automatically choose best model
                  </div>
                </div>
                
                {/* Provider Sections */}
                <div style={{ padding: '8px 0', borderBottom: '1px solid #f1f3f4' }}>
                  <div style={{ padding: '4px 16px', fontSize: '12px', color: '#6c757d', fontWeight: '600' }}>
                    GROQ MODELS
                  </div>
                  {['groq', 'llama-3.1-8b-instant', 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'].map(model => (
                    <div
                      key={model}
                      onClick={() => handleModelSelect(model)}
                      style={{
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: currentModel === model ? '#007bff' : '#495057',
                        background: currentModel === model ? '#f8f9ff' : 'transparent',
                        ':hover': {
                          background: '#f8f9fa'
                        }
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = currentModel === model ? '#f8f9ff' : '#f8f9fa';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = currentModel === model ? '#f8f9ff' : 'transparent';
                      }}
                    >
                      {getModelDisplayName(model)}
                    </div>
                  ))}
                </div>
                
                <div style={{ padding: '8px 0' }}>
                  <div style={{ padding: '4px 16px', fontSize: '12px', color: '#6c757d', fontWeight: '600' }}>
                    GEMINI MODELS
                  </div>
                  {['gemini', 'gemini-1.5-flash'].map(model => ( // Updated to SDK model name
                    <div
                      key={model}
                      onClick={() => handleModelSelect(model)}
                      style={{
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: currentModel === model ? '#007bff' : '#495057',
                        background: currentModel === model ? '#f8f9ff' : 'transparent',
                        ':hover': {
                          background: '#f8f9fa'
                        }
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = currentModel === model ? '#f8f9ff' : '#f8f9fa';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = currentModel === model ? '#f8f9ff' : 'transparent';
                      }}
                    >
                      {getModelDisplayName(model)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#ffffff' }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#212529', marginBottom: '12px' }}>Welcome to Clok AI</div>
              <div style={{ fontSize: '16px', color: '#6c757d', opacity: 0.8, maxWidth: '500px', margin: '0 auto', lineHeight: '1.5' }}>
                I can assist with writing, analysis, coding, creative projects, and much more.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {messages.map((message) => (
                <div key={message.id} style={{ display: 'flex', gap: '12px', maxWidth: '100%', flexDirection: message.sender === 'user' ? 'row-reverse' : 'row' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    flexShrink: 0, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '14px',
                    background: message.sender === 'user' ? '#6c757d' : '#007bff',
                    color: '#fff'
                  }}>
                    {message.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div style={{ flex: 1, maxWidth: 'calc(100% - 44px)', textAlign: message.sender === 'user' ? 'right' : 'left' }}>
                    <div style={{ 
                      display: 'inline-block', 
                      padding: '12px 16px', 
                      borderRadius: '18px', 
                      fontSize: '14px', 
                      lineHeight: '1.4', 
                      maxWidth: '100%', 
                      wordWrap: 'break-word',
                      background: message.sender === 'user' ? '#007bff' : '#f8f9fa',
                      color: message.sender === 'user' ? '#fff' : '#212529',
                      border: message.sender === 'user' ? 'none' : '1px solid #e9ecef',
                      borderRadius: message.sender === 'user' ? '18px 18px 4px 18px' : '18px'
                    }}>
                      {message.type === 'image' ? (
                        message.loading ? (
                          <div>Generating image...</div>
                        ) : (
                          <div>
                            <img 
                              src={message.imageUrl} 
                              alt={message.prompt}
                              style={{ width: '100%', borderRadius: '8px', marginBottom: '8px' }}
                            />
                            {message.prompt && (
                              <div style={{ fontSize: '12px', fontStyle: 'italic', opacity: 0.8 }}>
                                "{message.prompt}"
                              </div>
                            )}
                          </div>
                        )
                      ) : (
                        <div>{message.content}</div>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '6px', opacity: 0.7 }}>
                      {formatTime(message.timestamp)}
                    </div>
                    {message.sender === 'assistant' && message.type === 'text' && (
                      <button
                        onClick={() => handleSpeak(message.content)}
                        disabled={isSpeaking}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '12px',
                          color: '#6c757d',
                          cursor: 'pointer',
                          marginTop: '4px',
                          opacity: 0.7
                        }}
                        title="Read message"
                      >
                        🔊
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div style={{ display: 'flex', gap: '12px', maxWidth: '100%' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    flexShrink: 0, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '14px',
                    background: '#007bff',
                    color: '#fff'
                  }}>
                    <Bot size={16} />
                  </div>
                  <div style={{ flex: 1, maxWidth: 'calc(100% - 44px)' }}>
                    <div style={{ 
                      display: 'inline-block', 
                      padding: '12px 16px', 
                      borderRadius: '18px', 
                      fontSize: '14px', 
                      lineHeight: '1.4', 
                      maxWidth: '100%', 
                      wordWrap: 'break-word',
                      background: '#f8f9fa',
                      color: '#212529',
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <div style={{ width: '6px', height: '6px', background: '#6c757d', borderRadius: '50%', animation: 'typing 1.4s ease-in-out infinite' }}></div>
                        <div style={{ width: '6px', height: '6px', background: '#6c757d', borderRadius: '50%', animation: 'typing 1.4s ease-in-out infinite', animationDelay: '0.2s' }}></div>
                        <div style={{ width: '6px', height: '6px', background: '#6c757d', borderRadius: '50%', animation: 'typing 1.4s ease-in-out infinite', animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Section */}
        <div style={{ borderTop: '1px solid #e9ecef', background: '#f8f9fa', padding: '16px 20px' }}>
          {speechError && (
            <div style={{ marginBottom: '12px', padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
              <p style={{ color: '#dc2626', fontSize: '12px', margin: 0 }}>Speech error: {speechError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Send a message..."
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: '#fff',
                  border: '1px solid #ced4da',
                  borderRadius: '24px',
                  fontSize: '14px',
                  color: '#212529',
                  resize: 'none',
                  minHeight: '44px',
                  maxHeight: '120px',
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
                rows={1}
              />
              
              <div style={{ display: 'flex', gap: '8px' }}>
                {speechSupported && (
                  <button
                    type="button"
                    onClick={handleMicToggle}
                    style={{
                      width: '40px',
                      height: '40px',
                      border: 'none',
                      borderRadius: '50%',
                      background: isListening ? '#dc3545' : '#007bff',
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      transition: 'all 0.2s ease'
                    }}
                    title={isListening ? 'Stop recording' : 'Start voice input'}
                  >
                    {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                )}
                
                <button
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  style={{
                    width: '40px',
                    height: '40px',
                    border: 'none',
                    borderRadius: '50%',
                    background: '#007bff',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    transition: 'all 0.2s ease',
                    opacity: (!inputText.trim() || isTyping) ? 0.5 : 1
                  }}
                  title="Send message"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </form>

          {/* Input Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '12px', color: '#6c757d', marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>📄</span>
              <span>Send element</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>⚠️</span>
              <span>Send console errors (0)</span>
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{ fontSize: '12px', color: '#6c757d', textAlign: 'center', marginTop: '12px', opacity: 0.7 }}>
            Clok AI may make mistakes. Consider checking important information.
          </div>
        </div>
      </div>
    </div>
  );
};
