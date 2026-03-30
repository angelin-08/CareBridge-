# CarebridgeAI

"Your Health, Your Voice" - A voice-based AI bridge between patients and doctors, optimized for rural and semi-urban Indian users.

## Setup Instructions

### Frontend
1. `cd frontend`
2. `npm install`
3. Create a `.env` file with your Firebase and Backend URL:
   ```
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_PROJECT_ID=your_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_BACKEND_URL=http://localhost:8000
   ```
4. `npm run dev`

### Backend
1. `cd backend`
2. `pip install -r requirements.txt`
3. Create a `.env` file with your Anthropic key:
   ```
   ANTHROPIC_API_KEY=your_claude_key
   ```
4. `python main.py`

## Features
- Voice-to-Text in Tamil & English
- GenAI Symptom Analysis (Claude 3.5 Sonnet)
- Emergency Alert System (Tamil/English detection)
- Medical Report OCR Interpretation
- Digital Medical Vault (Firestore)
- Smart Medication Reminders with Notifications
- Impact Metrics Dashboard

## License
MIT
