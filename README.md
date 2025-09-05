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

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- `npm`, `yarn`, or `pnpm` package manager
- A valid **Google Gemini API Key**. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation & Setup

1.  **Clone the repository:**
    Your plan is correct! First, you'll need to create a repository on GitHub, upload the files, and then clone it.
    ```bash
    git clone https://github.com/your-username/memora-app.git
    cd memora-app
    ```

2.  **Install dependencies:**
    This project uses a standard Node.js setup. Run this command to install all the necessary libraries.
    ```bash
    npm install
    ```

3.  **Set up your environment variables:**
    Create a file named `.env` in the root of the project. This file will hold your secret API key. Add your Gemini API key to it like this:
    ```
    VITE_API_KEY=YOUR_GEMINI_API_KEY
    ```
    *This is a crucial step. The AI features will not work without it.*

4.  **Set up a trusted local HTTPS certificate (One-time setup):**
    Vite's default certificate can cause SSL errors on mobile devices. Using a tool called `mkcert` creates a certificate that your devices will trust.
    
    a. **Install `mkcert`**. Follow the instructions for your operating system on the [official mkcert repository](https://github.com/FiloSottile/mkcert). On macOS with Homebrew, for example, you would run `brew install mkcert`.

    b. **Install the local certificate authority**. In your terminal, run:
    ```bash
    mkcert -install
    ```
    You might be prompted for your system password. This makes the certificates you create trusted on your machine.

    c. **Generate the certificate files**. In the root directory of this project, run:
    ```bash
    mkcert localhost
    ```
    This will create two files: `localhost.pem` and `localhost-key.pem`. The project is now configured to use them automatically.

### Running the Development Server

1.  **Start the server:**
    This command will start the Vite development server, which compiles the code and makes it available in your browser.
    ```bash
    npm run dev
    ```

2.  **Open in your browser:**
    The application will be running at a local HTTPS address like `https://localhost:5173`.

### Testing on a Mobile Device

To test features like the camera, AR navigation, and fall detection, you must run the app on a physical mobile device.

1.  Ensure your computer and your mobile phone are connected to the **same Wi-Fi network**.

2.  Start the development server. The project is now configured to automatically enable a secure connection (required for camera/sensor access) and make the server visible on your local network.
    ```bash
    npm run dev
    ```

3.  The terminal will output a "Network" URL, which will look something like `https://192.168.1.10:5173`.

4.  Open the browser on your phone and navigate to that URL. Since you used `mkcert`, you should not see any privacy warnings.

5.  Grant the necessary permissions for the camera and motion sensors when prompted by the browser.