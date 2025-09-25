// ----------------------------
// Voice & Speech System for Weather Page
// ----------------------------
const synth = window.speechSynthesis;
let recognition;
const voiceStatus = document.getElementById('voice-status');
const currentStatus = document.getElementById('current-status');

// ----------------------------
// Speak function
// ----------------------------
function speak(text) {
  if (synth.speaking) synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  synth.speak(utter);
}

// ----------------------------
// Greeting & Voice Menu
// ----------------------------
function greetWeatherUser() {
  const greeting = `Welcome to WeatherEase Weather page!
To access weather, share your location or say a city.
Then choose an option:
1: Current temperature
2: Feels like
3: Condition
4: Humidity
5: Wind
6: 5-day forecast
7: Return to home screen`;
  speak(greeting);
  if (voiceStatus) voiceStatus.textContent = "Listening for weather commands...";
}

// ----------------------------
// Start voice recognition
// ----------------------------
function startWeatherRecognition() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    voiceStatus.textContent = "Speech recognition not supported in this browser.";
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = (event) => {
    const command = event.results[0][0].transcript.trim().toLowerCase();
    console.log("Heard:", command);
    handleWeatherCommand(command);
  };

  recognition.onerror = (event) => {
    console.error(event.error);
    if (voiceStatus) voiceStatus.textContent = `Error: ${event.error}`;
  };

  recognition.onend = () => {
    // Keep listening continuously
    recognition.start();
  };
}

// ----------------------------
// Handle commands
// ----------------------------
function handleWeatherCommand(cmd) {
  switch(cmd) {
    case '1':
    case 'temperature':
    case 'current temperature':
      speakCurrent('temp');
      break;
    case '2':
    case 'feels like':
      speakCurrent('feels');
      break;
    case '3':
    case 'condition':
      speakCurrent('desc');
      break;
    case '4':
    case 'humidity':
      speakCurrent('humidity');
      break;
    case '5':
    case 'wind':
      speakCurrent('wind');
      break;
    case '6':
    case '5-day forecast':
      speakForecast();
      break;
    case '7':
    case 'home':
    case 'return home':
      speak("Returning to home screen");
      window.location.href = "index.html";
      break;
    default:
      speak("Command not recognized, please try again.");
      break;
  }
}

// ----------------------------
// Speak current weather fields
// ----------------------------
function speakCurrent(field) {
  const el = document.querySelector(`[data-field="${field}"]`);
  if (el && el.textContent && el.textContent !== '—') {
    speak(`${field.replace('-', ' ')} is ${el.textContent}`);
  } else {
    speak(`Sorry, ${field} is not available`);
  }
}

// ----------------------------
// Speak 5-day forecast
// ----------------------------
function speakForecast() {
  const liNodes = document.querySelectorAll('#forecast-list li');
  if (!liNodes.length) { speak("No forecast data available."); return; }

  let forecastText = "Here is your 5-day forecast: ";
  liNodes.forEach(li => {
    const day = li.querySelector('[data-day]')?.textContent || '—';
    const high = li.querySelector('[data-high]')?.textContent || '—';
    const low = li.querySelector('[data-low]')?.textContent || '—';
    const desc = li.querySelector('[data-desc]')?.textContent || '—';
    forecastText += `${day}: High ${high}, Low ${low}, ${desc}. `;
  });

  speak(forecastText);
}

// ----------------------------
// Initialize on page load
// ----------------------------
window.addEventListener('DOMContentLoaded', () => {
  greetWeatherUser();
  startWeatherRecognition();
});
