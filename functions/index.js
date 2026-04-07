const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENROUTER_API,
});

const completion = await openRouter.chat.send({
  model: 'openai/gpt-5.2',
  messages: [
    {
      role: 'user',
      content: 'What is the meaning of life?',
    },
  ],
  stream: false,
});