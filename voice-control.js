// ----------------------------
// Voice & Speech System Setup
// ----------------------------
const voiceStatus = document.getElementById('voice-status');
const synth = window.speechSynthesis;
let recognition;

// ----------------------------
// Speak function
// ----------------------------
function speak(text) {
  if (synth.speaking) synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  synth.speak(utter);
}

// ----------------------------
// Start voice recognition
// ----------------------------
function startVoiceRecognition() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    if (voiceStatus) voiceStatus.textContent = "Speech recognition not supported in this browser.";
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  if (voiceStatus) voiceStatus.textContent = "Listening for commands...";
  recognition.start();

  recognition.onresult = (event) => {
    const command = event.results[0][0].transcript.trim().toLowerCase();
    console.log("Heard:", command);
    handleVoiceCommand(command);
  };

  recognition.onerror = (event) => {
    console.error(event.error);
    if (voiceStatus) voiceStatus.textContent = `Error: ${event.error}`;
  };

  recognition.onend = () => {
    recognition.start(); // continuous listening
  };
}

// ----------------------------
// Handle voice commands
// ----------------------------
function handleVoiceCommand(cmd) {
  const currentPage = window.location.pathname.split("/").pop();

  // --- Home page commands ---
  if (currentPage === 'index.html' || currentPage === '') {
    switch(cmd) {
      case '1':
      case 'get weather':
        speak("Navigating to Weather page");
        window.location.href = "weather.html";
        break;
      case '2':
      case 'settings':
        speak("Navigating to Settings");
        window.location.href = "settings.html";
        break;
      case '9':
      case 'exit':
        speak("Exiting WeatherEase. Goodbye!");
        window.location.href = "exit.html";
        break;
      case 'allow':
        speak("Voice features enabled.");
        break;
      default:
        speak("Command not recognized. Say 1 for Weather, 2 for Settings, 9 to Exit.");
        break;
    }
  }

  // --- Weather page commands ---
  if (currentPage === 'weather.html') {
    const tempBtn = document.getElementById('get-temp-btn');
    const geoBtn  = document.getElementById('geo-btn');
    switch(cmd) {
      case '1':
      case 'temperature':
      case 'get temperature':
        speak("Getting current temperature");
        tempBtn?.click();
        break;
      case '2':
      case 'feels like':
        speak("Getting 'feels like' temperature");
        tempBtn?.click();
        break;
      case '3':
      case 'condition':
      case 'weather condition':
        speak("Getting weather condition");
        tempBtn?.click();
        break;
      case '4':
      case 'humidity':
        speak("Getting humidity");
        tempBtn?.click();
        break;
      case '5':
      case 'wind':
        speak("Getting wind speed");
        tempBtn?.click();
        break;
      case '6':
      case 'forecast':
      case '5 day forecast':
      case 'five day forecast':
        speak("Reading 5 day forecast");
        readForecastAloud();
        break;
      case '7':
      case 'home':
        speak("Returning to home screen");
        window.location.href = "index.html";
        break;
      default:
        speak("Command not recognized. Say a number from 1 to 7.");
        break;
    }
  }
}

// ----------------------------
// Read 5-day forecast aloud
// ----------------------------
function readForecastAloud() {
  const list = document.querySelectorAll('#forecast-list li');
  if (!list.length) {
    speak("Forecast is not available.");
    return;
  }

  let msg = "5 day forecast: ";
  list.forEach((li, i) => {
    const day = li.querySelector('[data-day]')?.textContent ?? '';
    const high = li.querySelector('[data-high]')?.textContent ?? '';
    const low  = li.querySelector('[data-low]')?.textContent ?? '';
    const desc = li.querySelector('[data-desc]')?.textContent ?? '';
    msg += `Day ${i+1}, ${day}, high ${high}, low ${low}, condition ${desc}. `;
  });

  speak(msg);
}

// ----------------------------
// Auto-start on page load
// ----------------------------
window.addEventListener('DOMContentLoaded', () => {
  if (voiceStatus) voiceStatus.textContent = "Voice commands ready.";
  startVoiceRecognition();
});



