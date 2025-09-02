const aboutContainer = document.getElementById('about-container');
const mainContainer = document.getElementById('main-container');
const startButton = document.getElementById('start-button');
const emotionForm = document.getElementById('emotion-form');
const emotionInput = document.getElementById('emotion-input');
const verseContainerDiv = document.getElementById('verse-container');
const loadingIndicator = document.getElementById('loading-indicator');
const submitButton = document.getElementById('submit-button');
const audioPlayer = new Audio();
let versesData = {};
let verseList = [];
let currentVerseIndex = 0;

startButton.addEventListener('click', () => {
    aboutContainer.classList.add('hidden');
    mainContainer.classList.remove('hidden');
});

async function fetchVerses() {
    try {
        const response = await fetch('/static/verses.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        versesData = await response.json();
    } catch (error) {
        verseContainerDiv.innerHTML = `<p class="text-center text-danger">Error loading verses. Please check the 'verses.json' file.</p>`;
    }
}

emotionForm.addEventListener('submit', async(event) => {
    event.preventDefault();
    const feeling = emotionInput.value;

    submitButton.disabled = true;
    loadingIndicator.classList.remove('hidden');
    verseContainerDiv.innerHTML = '';
    verseContainerDiv.appendChild(loadingIndicator);

    try {
        const response = await fetch('/predictEmotion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: feeling })
        });

        if (!response.ok) {
            throw new Error(`Backend error: ${response.status}`);
        }

        const data = await response.json();
        const predictedEmotion = data.emotion;

        if (Object.keys(versesData).length > 0) {
            displayRandomVerse(predictedEmotion);
        } else {
            console.error("Verses data not loaded yet.");
            verseContainerDiv.innerHTML = `<p class="text-center text-danger">Could not load verses data.</p>`;
        }

    } catch (error) {
        console.error('Error fetching emotion from backend:', error);
        verseContainerDiv.innerHTML = `<p class="text-center text-danger">Sorry, there was an issue connecting to the server. Please try again.</p>`;
    } finally {
        submitButton.disabled = false;
        loadingIndicator.classList.add('hidden');
    }
});

function getEmotionalMessage(emotion) {
    switch (emotion) {
        case 'sadness':
            return "Oh, sorry to hear that you're feeling sad and low. May Allah grant you ease and comfort your heart. Ameen.";
        case 'joy':
            return "Alhamdulillah, it's wonderful that you're feeling happy! Here are some verses to help you express gratitude and turn your joy into worship.";
        case 'love':
            return "That's a beautiful feeling. Here are some verses about the love between a believer and Allah. May this love continue to grow in your heart. Ameen.";
        case 'anger':
            return "It's okay to feel angry, but remember that a believer's strength is in controlling their anger. Let these verses remind you to seek peace and forgiveness. Ameen.";
        case 'fear':
            return "Trust in Allah. It's understandable to feel scared, but remember that Allah is your ultimate protector and the best planner. Let these verses comfort your heart. Ameen.";
        case 'surprise':
            return "That's an unexpected emotion. Remember that Allah is the best of planners and there is a wisdom behind everything. May these verses help you understand His immense power. Ameen.";
        default:
            return "Here are some verses from the Quran for you. We pray they bring you peace and comfort.";
    }
}

function displayRandomVerse(emotion) {
    verseContainerDiv.innerHTML = '';

    const verses = versesData[emotion];
    if (verses && verses.length > 0) {
        const messageContainer = document.createElement('div');
        messageContainer.className = 'verse-card';
        messageContainer.style.marginBottom = '1.5rem';
        messageContainer.innerHTML = `<p style="text-align:center; color: var(--primary-color); font-size: 1.1rem; font-weight: 600;">${getEmotionalMessage(emotion)}</p>`;
        verseContainerDiv.appendChild(messageContainer);

        const randomIndex = Math.floor(Math.random() * verses.length);
        const verse = verses[randomIndex];

        const card = document.createElement('div');
        card.className = 'verse-card';
        card.style.animationDelay = '0.1s';

        card.innerHTML = `
                    <div class="ayah-header">
                        <h4 style="font-size: 1.25rem; font-weight: 700; color: var(--primary-color);">${verse.topic}</h4>
                        <span class="ayah-number">Ayah ${verse.ayah}</span>
                    </div>
                    <p class="arabic-text">${verse.arabic}</p>
                    <div class="play-section">
                        <button class="play-button">
                            <i class="fas fa-play"></i>
                        </button>
                        <p>Listen to the verse</p>
                    </div>
                    <h3 style="font-size: 1.5rem; font-weight: 600; margin: 1.5rem 0 0.5rem 0;">Translation</h3>
                    <p class="translation">${verse.translation}</p>
                    <div class="note">
                        <strong style="font-size: 1.2rem">Note:</strong> ${verse.noteToUser}
                    </div>
                `;
        verseContainerDiv.appendChild(card);

        const playButton = card.querySelector('.play-button');
        if (playButton && verse.ayah) {
            playButton.addEventListener('click', () => {
                playAudioFromCard(verse.ayah);
            });
        } else {
            playButton.disabled = true;
            playButton.style.opacity = '0.5';
            playButton.style.cursor = 'not-allowed';
            console.error('Error: Missing ayah property for the selected verse. The play button has been disabled.');
            verseContainerDiv.innerHTML += `<p class="text-center text-danger">Error: Missing verse data. Audio playback is unavailable.</p>`;
        }
    } else {
        verseContainerDiv.innerHTML = `<p class="text-center text-muted">No verses found for that emotion.</p>`;
    }
}

const playNextVerse = async() => {
    if (currentVerseIndex < verseList.length) {
        const ayah = verseList[currentVerseIndex];
        try {
            const jsonApiUrl = `https://api.alquran.cloud/v1/ayah/${ayah}/ar.alafasy`;
            const response = await fetch(jsonApiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (!data.data || !data.data.audio) {
                throw new Error('Audio URL not found in API response.');
            }
            const audioUrl = data.data.audio;
            audioPlayer.src = audioUrl;
            audioPlayer.play();
            currentVerseIndex++;
        } catch (e) {
            console.error('Error playing audio:', e);
            verseContainerDiv.innerHTML = `<p class="text-center text-danger">An unexpected error occurred while playing the audio. Please try again.</p>`;
        }
    } else {
        audioPlayer.onended = null;
        verseList = [];
        currentVerseIndex = 0;
    }
};

window.playAudioFromCard = async(ayah) => {
    audioPlayer.onended = playNextVerse;
    if (ayah.includes('-')) {
        const parts = ayah.split(':');
        const surah = parts[0];
        const rangeParts = parts[1].split('-');
        const start = parseInt(rangeParts[0], 10);
        const end = parseInt(rangeParts[1], 10);

        verseList = [];
        for (let i = start; i <= end; i++) {
            verseList.push(`${surah}:${i}`);
        }
        currentVerseIndex = 0;
    } else {
        verseList = [ayah];
        currentVerseIndex = 0;
    }
    playNextVerse();
};


document.addEventListener('DOMContentLoaded', fetchVerses);
