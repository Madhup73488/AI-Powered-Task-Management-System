# AI Features Documentation

## Overview
This project now includes three AI-powered features using Vercel AI SDK and OpenAI:

1. **AI Task Summary Generator** - Automatically generate concise task titles from descriptions
2. **Smart Due Date Suggestions** - AI-powered deadline recommendations based on task analysis
3. **Task Query Chatbot** - Interactive AI assistant for querying and managing tasks

## Setup Instructions

### 1. Install Dependencies
```bash
npm install ai @ai-sdk/openai zod
```

### 2. Configure OpenAI API Key
Add your OpenAI API key to `.env.local`:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Get an OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy and paste it into `.env.local`

## Features

### 1. AI Task Summary Generator
**Location:** Admin Tasks Page - Create Task Dialog

**How it works:**
- Click the sparkle icon (✨) next to the Title field
- AI analyzes your task description
- Generates a concise 2-3 sentence summary as the title
- Uses GPT-4o-mini for fast, cost-effective results

**Example:**
```
Description: "We need to implement a new authentication system using JWT tokens. 
This should include user registration, login, logout, and password reset 
functionality. Must integrate with our existing PostgreSQL database."

Generated Title: "Implement JWT-based authentication system with user 
management and PostgreSQL integration."
```

### 2. Smart Due Date Suggestions
**Location:** Admin Tasks Page - Create Task Dialog

**How it works:**
- Fill in the task title and description
- Click the calendar icon (📅) next to the Deadline field
- AI analyzes task complexity, priority, and scope
- Suggests a realistic deadline in days from today
- Automatically sets the date field

**Considerations:**
- Task complexity and scope
- Priority level (high = sooner, low = later)
- Industry standards for similar tasks
- Capped at 90 days maximum

**Example:**
```
Title: "Implement JWT Authentication"
Description: "Complete auth system with registration, login, password reset"
Priority: High

Suggested Deadline: 7 days from today
```

### 3. Task Query Chatbot
**Location:** Available on Admin Tasks Page and Employee Dashboard

**How it works:**
- Click the floating chat icon (💬) in the bottom-right corner
- Ask questions about your tasks in natural language
- AI provides contextual answers based on your actual task data
- Streams responses in real-time

**Capabilities:**
- Query tasks by status, priority, or deadline
- Get task summaries and overviews
- Find specific tasks
- Understand workload and progress

**Example Queries:**
```
"What tasks are due this week?"
"Show me all high priority tasks"
"What's my current workload?"
"Which tasks are overdue?"
"What tasks am I working on?"
"Summarize my completed tasks"
```

**Context:**
- Accesses your last 50 tasks
- Aware of task status, priority, deadlines
- Personalized to your user ID
- Remembers conversation context

## API Endpoints

### POST /api/ai/summarize-task
Generates a concise summary from a task description.

**Request:**
```json
{
  "description": "Long task description..."
}
```

**Response:**
```json
{
  "summary": "Concise 2-3 sentence summary"
}
```

### POST /api/ai/suggest-deadline
Suggests a deadline based on task details.

**Request:**
```json
{
  "title": "Task title",
  "description": "Task description",
  "priority": "high|medium|low"
}
```

**Response:**
```json
{
  "days": 7
}
```

### POST /api/ai/chat
Streaming chat endpoint for task queries.

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "What tasks are due today?" }
  ],
  "userId": "user-uuid"
}
```

**Response:**
Streaming text response with task information.

## Cost Optimization

All features use **GPT-4o-mini** which is:
- 60x cheaper than GPT-4
- Fast response times
- Good quality for these use cases

**Estimated Costs:**
- Summary generation: ~$0.0001 per request
- Deadline suggestion: ~$0.00005 per request
- Chat query: ~$0.0002 per query

## Security Notes

1. **API Key Protection:**
   - Never commit `.env.local` to Git
   - Add to `.gitignore`
   - Use environment variables in production

2. **User Authorization:**
   - Chatbot only accesses tasks for authenticated user
   - Requires valid user ID
   - Server-side validation

3. **Rate Limiting:**
   - Consider adding rate limits in production
   - Monitor OpenAI usage dashboard
   - Set usage budgets

## Troubleshooting

### "Failed to generate summary"
- Check OpenAI API key is valid
- Verify API key has sufficient credits
- Check network connection
- Review browser console for errors

### Chatbot not responding
- Ensure user is logged in
- Check API key in `.env.local`
- Verify Supabase connection
- Check browser network tab for errors

### Deadline suggestion returns default value
- Make sure both title and description are filled
- Check OpenAI API response in console
- Verify API key permissions

## Future Enhancements

Potential additions:
- Task auto-categorization
- Priority prediction based on content
- Workload balancing suggestions
- Smart task assignment recommendations
- Email summary generation
- Meeting notes to tasks conversion
- Voice input for task creation
- Multi-language support

## Component Files

- `/app/api/ai/summarize-task/route.ts` - Summary generation API
- `/app/api/ai/suggest-deadline/route.ts` - Deadline suggestion API
- `/app/api/ai/chat/route.ts` - Chatbot streaming API
- `/app/components/TaskChatbot.tsx` - Chatbot UI component

## Dependencies

```json
{
  "ai": "^3.x",
  "@ai-sdk/openai": "^0.x",
  "zod": "^3.x"
}
```

## Learn More

- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [GPT-4o-mini Pricing](https://openai.com/pricing)
