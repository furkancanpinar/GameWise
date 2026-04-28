## To-Do
- [ x ] GameWAi system does not have the Welcome message fix it
- [ ] Settings should apply changes to all the pages
- [ ] Improve the ui so everypages matches the same position for searchbar
- [ ] Improve profile page
- [ ] API for firebase should be hidden
- [ ] API for Chatgpt should be hidden. ✅ Done - Moved to backend
- [ ] Self assessment collapsing menu

## Backend Setup for AI Chat

To run the AI chat feature securely:

1. Install dependencies: `npm install`
2. Create a `.env` file with your OpenAI API key: `OPENAI_API_KEY=your_key_here`
3. Start the server: `npm start` (runs on port 3000)
4. For development: `npm run dev`

The frontend now calls `http://localhost:3000/api/chat` instead of OpenAI directly, keeping the API key hidden.
