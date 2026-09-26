const { GoogleGenAI } = require('@google/genai');

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file.');
  }
  return new GoogleGenAI({ apiKey });
};

const generateAnswer = async (question) => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: `You are a helpful assistant. Provide a clear, concise, and direct answer to the following question:\n\nQuestion: ${question}`,
    });

    if (!response || !response.text) {
      throw new Error('No response text received from Gemini API');
    }

    return response.text.trim();
  } catch (error) {
    console.error('Caught error object:', error);
    const errorMessage = typeof error === 'string' ? error : (error?.message || 'Unknown error');
    throw new Error(`AI Answer Generation failed: ${errorMessage}`);
  }
};

const generateFAQ = async (topic) => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: `Generate a single frequently asked question (FAQ) and its comprehensive answer regarding: ${topic}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            question: {
              type: 'STRING',
              description: 'A clear, common question that a user would ask about the topic.',
            },
            answer: {
              type: 'STRING',
              description: 'A detailed, helpful, and accurate answer explaining the question.',
            },
          },
          required: ['question', 'answer'],
        },
      },
    });

    if (!response || !response.text) {
      throw new Error('No response received from Gemini API');
    }

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Error in geminiService.generateFAQ:', error);
    throw new Error(`AI FAQ Generation failed: ${error.message}`);
  }
};

module.exports = {
  generateAnswer,
  generateFAQ,
};