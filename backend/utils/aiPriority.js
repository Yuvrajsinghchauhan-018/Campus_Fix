const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.analyzeComplaint = async (title, description) => {
  try {
    const prompt = `Analyze this college maintenance complaint and return ONLY a JSON object with no extra text: priority (Low or Medium or High or Urgent), category (Electrical or Plumbing or Furniture or Computer or AC or Carpentry or Other), reason (one sentence explanation), estimatedFixTimeHours (a number).
    
    Complaint Title: ${title}
    Complaint Description: ${description}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const resultText = response.choices[0].message.content.trim();
    return JSON.parse(resultText);
  } catch (error) {
    console.error('OpenAI Error:', error);
    return null;
  }
};
