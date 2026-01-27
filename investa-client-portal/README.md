<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1tnwpt2Hjl-3TF-xaPN86f0YBPjoKwEzI

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

Development: backend API base URL
- The client defaults to `http://localhost:5000` for the API server. You have three options to change it:

1. Set a runtime global in `index.html` before the app mounts:
```html
<script>
  // Example: override during development
  window.__INVESTA_API_BASE = 'http://localhost:5235';
</script>
```
2. Set a server-injected meta tag in your hosting HTML (picked up automatically):
```html
<meta name="investa-api-base" content="http://localhost:5235" />
```
3. During bootstrap, you can change the token provider in `src/main.ts` to point to a different base.

This makes the client configurable for different environments without rebuilding.
