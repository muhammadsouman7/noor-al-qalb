Noor Al-Qalb: Where your heart meets the Quran.

This web application provides a unique, emotionally-aware search for Qur'anic verses. By simply typing how you feel, the app uses a powerful sentiment analysis model to find and present verses that are relevant to your emotional state, offering guidance and comfort directly from the Quran.

Key Features:

1. Emotion-Based Verse Search: Get instant access to Qur'anic verses tailored to your specific feelings, such as joy, sadness, fear, or anger.

2. Dual-Tier Architecture: The app is built with a decoupled architecture, separating the front-end (hosted on Vercel) from the heavy machine learning model (leveraged via the Hugging Face Inference API), ensuring fast performance and easy deployment.

3. Audio Playback: Listen to the beautiful recitation of each verse for a more immersive and spiritual experience.

4. User-Friendly Interface: A clean and modern design that makes it easy to find peace and comfort.

Getting Started:

Follow these steps to set up and run the project on your local machine.

-> Prerequisites

You'll need a Hugging Face user access token. You can create one with "Read" permissions in your Hugging Face account settings.

-> Installation
   
1. Clone this repository to your local machine:

        git clone https://github.com/muhammadsouman7/noor-al-qalb.git
        cd noor-al-qalb

2. Install the required Python libraries using the requirements.txt file:

        pip install -r requirements.txt

-> Local Setup

1. Create a file named .env in the root directory of your project.

2. Open the .env file and add your Hugging Face token:

       kinky=your_hugging_face_token_here

3. Run the Flask application:

       python app.py

The app will be accessible at http://127.0.0.1:5000.
