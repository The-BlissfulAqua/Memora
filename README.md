# Memora: AI Dementia Companion

An AI and AR-powered companion application designed to provide comprehensive support for dementia patients, their caregivers, and their families. Memora aims to enhance the daily lives of patients by providing tools for navigation, reminders, and cognitive engagement, while keeping caregivers and family members connected and informed.

## ✨ Features

Memora is a single application with three distinct views, each tailored to a specific user.

### 🧑‍⚕️ Patient View
The primary interface for the person with dementia, designed for simplicity and ease of use.
- **AR Home Navigation:** Uses the phone's camera and compass to provide simple, turn-by-turn directions to rooms within the home.
- **AI Companion ("Digi"):** A friendly, voice-enabled AI chatbot for conversation and emotional support, powered by the Gemini API.
- **Emotion Detection:** Uses the front-facing camera and `face-api.js` to non-intrusively detect the patient's emotional state and log it for caregivers.
- **Daily Reminders:** Simple, icon-driven reminders for medications, meals, and hydration.
- **Cognitive Games:** A simple memory matching game to provide gentle mental stimulation.
- **Memory Album:** A visual album of photos and captions shared by family members.
- **Voice Messages:** A simple way to send and receive voice notes from family and caregivers.
- **Emergency SOS:** A large, prominent button to alert caregivers and family in case of an emergency.
- **Fall Detection:** Automatically detects potential falls using the phone's accelerometer and sends an alert.

### ดูแล Caregiver View
A dashboard for professional caregivers to manage the patient's daily routine and monitor their well-being.
- **Alerts Dashboard:** Displays urgent alerts for SOS button presses, falls, and significant negative emotions.
- **Schedule Management:** Add, view, and delete daily reminders for the patient.
- **Voice Mailbox:** Send and review voice messages with the patient and family.

### 👨‍👩‍👧 Family View
A portal for family members to stay connected and involved in their loved one's care.
- **Activity Timeline:** A real-time log of patient activities, such as completed reminders, detected emotions, and shared memories.
- **Share Memories:** Easily upload photos and captions to the patient's Memory Album.
- **Send Comforting Thoughts:** Use AI to generate and send a short, uplifting quote to the patient's home screen.
- **Voice Messages:** Share voice notes to stay connected personally.
- **View Schedule & Alerts:** Stay informed about the patient's daily plan and any urgent alerts.

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **AI/ML:**
    - Google Gemini API (`@google/genai`) for the AI companion and quote generation.
    - `face-api.js` for client-side emotion and face recognition.
- **Web APIs:**
    - `getUserMedia` (Camera API)
    - `DeviceOrientationEvent` (Compass/Motion Sensors)
    - `SpeechRecognition` (Voice Input)
    - `MediaRecorder` (Audio Recording)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- `npm`, `yarn`, or `pnpm` package manager
- A valid **Google Gemini API Key**. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/memora-app.git
    cd memora-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your environment variables:**
    Create a file named `.env` in the root of the project. This file will hold your secret API key. Add your Gemini API key to it like this:
    ```
    VITE_API_KEY=YOUR_GEMINI_API_KEY
    ```
    *This is a crucial step. The AI features will not work without it.*

## 🏃 Running the Development Server

### For Desktop Development

You can start the server immediately for development on your computer.

1.  **Start the server:**
    ```bash
    npm run dev
    ```
2.  **Open in your browser:**
    Navigate to the local HTTPS URL provided (e.g., `https://localhost:5173`). Your browser will show a security warning because the SSL certificate is self-signed. You can safely click "Advanced" and proceed to the site.

### For Mobile Device Testing (Recommended)

To test features like the camera, AR navigation, and fall detection, you **must** run the app on a physical mobile device using a trusted SSL certificate.

This is a **one-time setup** that creates a trusted certificate on your machine.

1.  **Install `mkcert`:**
    Follow the official instructions for your operating system on the [mkcert repository](https://github.com/FiloSottile/mkcert). On macOS with Homebrew, for example, run: `brew install mkcert`.

2.  **Create a local Certificate Authority:**
    In your terminal, run the following command. You may be prompted for your password.
    ```bash
    mkcert -install
    ```

3.  **Generate Certificate Files:**
    In the root directory of this project, run:
    ```bash
    mkcert localhost
    ```
    This creates two files: `localhost.pem` and `localhost-key.pem`. The dev server will automatically detect and use them.

4.  **Run the Server & Connect:**
    a. Make sure your computer and mobile phone are on the **same Wi-Fi network**.
    b. Start the dev server:
       ```bash
       npm run dev
       ```
    c. The terminal will output a "Network" URL (e.g., `https://192.168.1.10:5173`).
    d. Open your phone's browser and go to that Network URL. The page should load securely without any warnings.
    e. Grant camera and motion sensor permissions when prompted.