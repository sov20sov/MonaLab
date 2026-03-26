<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/c6e1ec20-0acd-4dfb-8c32-0896ae2616ea

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. أضف في [.env.local](.env.local) مفتاح **Groq**: `GROQ_API_KEY=...`  
   (ما زال دعم الاسم القديم `GEMINI_API_KEY` ممكناً مؤقتاً للتوافق)
3. Run the app:
   `npm run dev`
