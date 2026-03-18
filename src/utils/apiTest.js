// Quick synchronous test - run this in browser console
window.quickTest = function() {
  console.log('🚀 Quick API Test');
  console.log('Groq API Key:', window.VITE_GROQ_API_KEY ? '✅ present' : '❌ missing');
  console.log('Gemini API Key:', window.VITE_GEMINI_API_KEY ? '✅ present' : '❌ missing');
  
  // Test Groq immediately
  if (window.VITE_GROQ_API_KEY) {
    fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + window.VITE_GROQ_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{role: 'user', content: 'Hello test'}],
        max_tokens: 20
      })
    }).then(response => {
      console.log('Groq status:', response.status);
      return response.json();
    }).then(data => {
      console.log('✅ Groq success:', data.choices[0].message.content);
    }).catch(error => {
      console.error('❌ Groq error:', error);
    });
  }
  
  // Test Gemini models immediately
  if (window.VITE_GEMINI_API_KEY) {
    fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + window.VITE_GEMINI_API_KEY)
    .then(response => {
      console.log('Gemini models status:', response.status);
      return response.json();
    }).then(data => {
      console.log('✅ Available Gemini models:');
      data.models.forEach(model => {
        console.log(`  - ${model.name} (${model.displayName})`);
        console.log(`    Methods: ${model.supportedGenerationMethods?.join(', ') || 'None'}`);
      });
    }).catch(error => {
      console.error('❌ Gemini error:', error);
    });
  }
  
  console.log('🎉 Test started - check console for results above');
};

// Also keep the original function
window.testGroqAPI = async function() {
  console.log('🚀 Starting API tests...');
  
  const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  
  console.log('📋 API Keys Status:');
  console.log('Groq API key:', GROQ_API_KEY ? '✅ present' : '❌ missing');
  console.log('Gemini API key:', GEMINI_API_KEY ? '✅ present' : '❌ missing');
  
  // Test Groq
  if (GROQ_API_KEY) {
    try {
      console.log('\n🔄 Testing Groq API...');
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'user',
              content: 'Hello, just testing the connection'
            }
          ],
          max_tokens: 50,
          temperature: 0.7,
        })
      });
      
      console.log('Groq API response status:', response.status);
      
      if (!response.ok) {
        const error = await response.text();
        console.error('❌ Groq API error:', error);
      } else {
        const data = await response.json();
        console.log('✅ Groq API success:', data.choices[0].message.content);
      }
    } catch (error) {
      console.error('❌ Groq API network error:', error);
    }
  }
  
  // List Gemini models
  if (GEMINI_API_KEY) {
    try {
      console.log('\n🔄 Listing available Gemini models...');
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + GEMINI_API_KEY);
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Available Gemini models:');
        data.models.forEach(model => {
          console.log(`  - ${model.name} (${model.displayName})`);
          console.log(`    Supported methods: ${model.supportedGenerationMethods?.join(', ') || 'None'}`);
        });
      } else {
        console.error('❌ Error listing Gemini models:', await response.text());
      }
    } catch (error) {
      console.error('❌ Gemini models list error:', error);
    }
  }
  
  console.log('\n🎉 API test complete!');
};

console.log('Multi-API test function ready! Run: testGroqAPI()');
