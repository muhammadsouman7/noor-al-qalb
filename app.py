import os
import json
from flask import Flask, render_template, request, jsonify
import requests
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# This URL is fixed and points directly to the model's inference endpoint.
API_URL = "https://api-inference.huggingface.co/models/bhadresh-savani/distilbert-base-uncased-emotion"

@app.route('/')
def homePage():
    return render_template('index.html')

@app.route('/predictEmotion', methods=['POST'])
def predictEmotion():
    # Analyzes the emotion from the provided text using the Hugging Face Inference API.
    requestData = request.json
    userText = requestData.get('text', '')

    if not userText:
        return jsonify({'error': 'No text provided.'}), 400

    try:
        headers = {
            "Authorization": f"Bearer {os.environ['kinky']}",
        }
        
        payload = {
            "inputs": userText,
            "parameters": {
                "return_all_scores": True
            }
        }
        
        # Make the request to the Hugging Face Inference API
        response = requests.post(API_URL, headers=headers, json=payload, timeout=15)
        response.raise_for_status()  # Raises an HTTPError for bad responses

        # The API returns a list of dictionaries with emotion labels and scores.
        # We find the one with the highest score.
        predictionResult = response.json()
        scoreList = predictionResult[0]
        highestScoreEmotion = max(scoreList, key=lambda x: x['score'])
        predictedEmotion = highestScoreEmotion['label']

        # Handling cases where the predicted emotion is not in the JSON file.
        # This is a common issue with a fixed set of verses.
        with open('static/verses.json', 'r', encoding='utf-8') as f:
            verses_data = json.load(f)
            # We are using 'joy' as a general positive emotion
            if predictedEmotion not in verses_data:
                predictedEmotion = 'joy'

        return jsonify({'emotion': predictedEmotion})

    except requests.exceptions.RequestException as e:
        print(f"Error calling Hugging Face API: {e}")
        return jsonify({'error': 'Failed to get prediction from Hugging Face.'}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({'error': 'An internal server error occurred.'}), 500

if __name__ == '__main__':
    app.run(debug=True)
