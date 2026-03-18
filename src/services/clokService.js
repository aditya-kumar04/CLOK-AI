// CLOK AI Service - Free Model Integration
import { GoogleGenAI } from '@google/genai'; // ✅ Correct package

export const clokService = {
  // API Configuration
  GROQ_API_KEY: import.meta.env.VITE_GROQ_API_KEY || '',
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',

  GROQ_API_URL: 'https://api.groq.com/openai/v1/chat/completions',

  currentModel: 'auto', // always starts clean

  // ✅ Valid model lists — single source of truth
  GROQ_MODELS: [
    'llama-3.1-8b-instant',
    'llama-3.1-70b-versatile',
    'mixtral-8x7b-32768',
    'gemma2-9b-it'
  ],

  GEMINI_MODELS: [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.5-flash'
  ],

  MODELS: {
    // Groq defaults
    GROQ_FAST:    'llama-3.1-8b-instant',
    GROQ_SMART:   'llama-3.1-70b-versatile',
    GROQ_MIXTRAL: 'mixtral-8x7b-32768',
    GROQ_GEMMA:   'gemma2-9b-it',

    // ✅ Gemini defaults (2.0+ only)
    GEMINI_FLASH:      'gemini-2.0-flash',
    GEMINI_FLASH_LITE: 'gemini-2.0-flash-lite',
    GEMINI_25_FLASH:   'gemini-2.5-flash',

    DEFAULT: 'auto'
  },

  SYSTEM_PROMPT: `You are CLOK AI, a helpful and friendly AI assistant. You are:
- Knowledgeable and accurate
- Friendly and conversational
- Helpful with coding, writing, analysis, and creative tasks
- Concise but thorough in your responses
- Always professional but approachable`,

  // ─── Main entry point ───────────────────────────────────────────────────────
  async sendMessage(message, options = {}) {
    // 1. Handle slash commands first
    const commandResult = await this.handleSpecialCommands(message);
    if (commandResult) return commandResult;

    // 2. Pick best available API
    const selectedAPI = this.selectBestAPI();
    console.log('Selected API:', selectedAPI, '| currentModel:', this.currentModel);

    if (!selectedAPI) return this.getMockResponse();

    // 3. Try primary API
    try {
      switch (selectedAPI) {
        case 'gemini': return await this.callGeminiAPI(message, options);
        case 'groq':   return await this.callGroqAPI(message, options);
        default:       throw new Error('No valid API available');
      }
    } catch (primaryError) {
      console.error('Primary API failed:', primaryError.message);

      // 4. Try fallback API
      const fallback = this.getFallbackAPI(selectedAPI);
      if (fallback) {
        console.log('Trying fallback API:', fallback);
        try {
          switch (fallback) {
            case 'gemini': return await this.callGeminiAPI(message, options);
            case 'groq':   return await this.callGroqAPI(message, options);
          }
        } catch (fallbackError) {
          console.error('Fallback API also failed:', fallbackError.message);
        }
      }

      return this.getFallbackResponse();
    }
  },

  // ─── API selector ───────────────────────────────────────────────────────────
  selectBestAPI() {
    if (this.currentModel !== 'auto') {
      if (this.currentModel === 'groq'   && this.GROQ_API_KEY)   return 'groq';
      if (this.currentModel === 'gemini' && this.GEMINI_API_KEY) return 'gemini';
      if (this.currentModel === 'openai' && this.OPENAI_API_KEY) return 'openai';

      // Specific Groq model selected
      if (this.GROQ_MODELS.includes(this.currentModel))
        return this.GROQ_API_KEY ? 'groq' : null;

      // Specific Gemini model selected
      if (this.GEMINI_MODELS.includes(this.currentModel))
        return this.GEMINI_API_KEY ? 'gemini' : null;
    }

    // Auto: prefer Gemini, fall back to Groq
    if (this.GEMINI_API_KEY) return 'gemini';
    if (this.GROQ_API_KEY)   return 'groq';
    return null;
  },

  getFallbackAPI(primary) {
    if (this.GEMINI_API_KEY && primary !== 'gemini') return 'gemini';
    if (this.GROQ_API_KEY   && primary !== 'groq')   return 'groq';
    return null;
  },

  // ─── ✅ Gemini via @google/genai SDK ────────────────────────────────────────
  async callGeminiAPI(message, options = {}) {
    if (!this.GEMINI_API_KEY) throw new Error('Gemini API key not configured');

    // ✅ Only use currentModel if it's a valid Gemini model
    const model = this.GEMINI_MODELS.includes(this.currentModel)
      ? this.currentModel
      : this.MODELS.GEMINI_FLASH; // safe default: 'gemini-2.0-flash'

    console.log(`🔄 Calling Gemini SDK | model: ${model}`);

    const ai = new GoogleGenAI({ apiKey: this.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model,
      contents: message,
      config: {
        systemInstruction: this.SYSTEM_PROMPT,
        temperature:       options.temperature  ?? 0.7,
        maxOutputTokens:   options.maxTokens    ?? 1000,
      }
    });

    const content = response.text;
    if (!content) throw new Error('Empty response from Gemini');

    return {
      type:     'text',
      content:  content.trim(),
      sender:   'assistant',
      model,
      provider: 'Google Gemini'
    };
  },

  // ─── Groq API ───────────────────────────────────────────────────────────────
  async callGroqAPI(message, options = {}) {
    if (!this.GROQ_API_KEY) throw new Error('Groq API key not configured');

    // ✅ Only use currentModel if it's a valid Groq model
    const model = this.GROQ_MODELS.includes(this.currentModel)
      ? this.currentModel
      : this.MODELS.GROQ_FAST; // safe default: 'llama-3.1-8b-instant'

    console.log(`🔄 Calling Groq API | model: ${model}`);

    const response = await fetch(this.GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.GROQ_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: this.SYSTEM_PROMPT },
          { role: 'user',   content: message }
        ],
        max_tokens:  options.maxTokens   ?? 1000,
        temperature: options.temperature ?? 0.7,
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Groq Error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from Groq');

    return {
      type:     'text',
      content:  content.trim(),
      sender:   'assistant',
      model,
      provider: 'Groq'
    };
  },

  // ─── Slash commands ─────────────────────────────────────────────────────────
  async handleSpecialCommands(message) {
    // /generate
    if (message.startsWith('/generate ')) {
      const prompt = message.replace('/generate ', '').trim();
      return {
        type:     'image',
        content:  `Here's an image based on: "${prompt}"`,
        imageUrl: `https://picsum.photos/seed/${encodeURIComponent(prompt)}/512/512.jpg`,
        prompt,
        sender:   'assistant'
      };
    }

    // /help
    if (message.startsWith('/help')) {
      return {
        type: 'text',
        content: `**CLOK AI Commands:**
- /help - Show this help message
- /generate [prompt] - Generate an image
- /model - Show available models & status
- /use [model] - Switch to a specific model

**Gemini Models:**
- gemini-2.0-flash
- gemini-2.0-flash-lite
- gemini-2.5-flash

**Groq Models:**
- llama-3.1-8b-instant
- llama-3.1-70b-versatile
- mixtral-8x7b-32768
- gemma2-9b-it

**Shortcuts:**
- /use auto   — auto select best model
- /use groq   — any Groq model
- /use gemini — any Gemini model`,
        sender: 'assistant'
      };
    }

    // /use
    if (message.startsWith('/use ')) {
      const model = message.replace('/use ', '').trim().toLowerCase();

      const allValid = [
        'auto', 'groq', 'gemini',
        ...this.GROQ_MODELS,
        ...this.GEMINI_MODELS
      ];

      if (!allValid.includes(model)) {
        return {
          type:    'text',
          content: `❌ Invalid model: **"${model}"**\n\nValid options:\n${allValid.map(m => `• ${m}`).join('\n')}`,
          sender:  'assistant'
        };
      }

      // Check API key availability
      const needsGemini = model === 'gemini' || this.GEMINI_MODELS.includes(model);
      const needsGroq   = model === 'groq'   || this.GROQ_MODELS.includes(model);

      if (needsGemini && !this.GEMINI_API_KEY) {
        return {
          type:    'text',
          content: '❌ No Gemini API key found.\nAdd **VITE_GEMINI_API_KEY** to your .env file.',
          sender:  'assistant'
        };
      }
      if (needsGroq && !this.GROQ_API_KEY) {
        return {
          type:    'text',
          content: '❌ No Groq API key found.\nAdd **VITE_GROQ_API_KEY** to your .env file.',
          sender:  'assistant'
        };
      }

      this.currentModel = model;
      return {
        type:    'text',
        content: `✅ Now using **${model}**\nType /model to check full status.`,
        sender:  'assistant'
      };
    }

    // /model
    if (message.startsWith('/model')) {
      const activeAPI = this.selectBestAPI();
      return {
        type: 'text',
        content: `**🤖 Model Status**

**Google Gemini:** ${this.GEMINI_API_KEY ? '✅ Available' : '❌ No API key'}
Models: ${this.GEMINI_MODELS.join(', ')}

**Groq:** ${this.GROQ_API_KEY ? '✅ Available' : '❌ No API key'}
Models: ${this.GROQ_MODELS.join(', ')}

**Current selection:** ${this.currentModel}
**Active API:** ${activeAPI ?? 'None — no API keys configured'}`,
        sender: 'assistant'
      };
    }

    return null; // not a command
  },

  // ─── Utility ─────────────────────────────────────────────────────────────────
  getMockResponse() {
    return {
      type:    'text',
      content: '⚠️ No API keys configured.\nAdd **VITE_GEMINI_API_KEY** or **VITE_GROQ_API_KEY** to your .env file.',
      sender:  'assistant',
      isDemo:  true
    };
  },

  getFallbackResponse() {
    return {
      type:    'text',
      content: '❌ All AI services failed to respond.\nCheck your API keys and network connection, then try again.',
      sender:  'assistant',
      isError: true
    };
  },

  isConfigured() {
    return !!(this.GROQ_API_KEY || this.GEMINI_API_KEY);
  },

  getStatus() {
    return {
      configured:      this.isConfigured(),
      currentModel:    this.currentModel,
      selectedAPI:     this.selectBestAPI(),
      geminiAvailable: !!this.GEMINI_API_KEY,
      groqAvailable:   !!this.GROQ_API_KEY,
    };
  },

  // Speech stubs (browser handles these externally)
  async transcribeAudio(audioBlob) {
    console.log('Audio transcription not implemented');
    return null;
  },

  async synthesizeSpeech(text) {
    console.log('Speech synthesis not implemented');
    return null;
  }
};