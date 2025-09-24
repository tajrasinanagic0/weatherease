// ----------------------------
// Voice & Speech System Setup
// ----------------------------
const voiceStatus = document.getElementById('current-status');
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
// Greeting / Voice Options
// ----------------------------
function greetWeather() {
  speak(`To access weather, share your location or say a city name.`);
  voiceStatus.textContent = "Awaiting voice command...";
}

// ----------------------------
// Start voice recognition
// ----------------------------
function startVoiceRecognition() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    voiceStatus.textContent = "Voice not supported. Use buttons.";
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = (event) => {
    const command = event.results[0][0].transcript.trim();
    console.log("Heard:", command);
    handleVoiceCommand(command);
  };

  recognition.onerror = (event) => {
    console.error(event.error);
    voiceStatus.textContent = `Error: ${event.error}`;
  };

  recognition.onend = () => recognition.start(); // Continuous listening
}

// ----------------------------
// Voice command mapping
// ----------------------------
function handleVoiceCommand(command) {
  const cmd = command.toLowerCase();

  switch(cmd) {
    case 'home':
      speak("Returning home");
      window.location.href = "index.html";
      break;
    case 'settings':
      speak("Opening settings");
      window.location.href = "settings.html";
      break;
    case 'exit':
      speak("Exiting app");
      window.location.href = "exit.html";
      break;
    case 'use my location':
      document.getElementById('geo-btn')?.click();
      break;
    case 'current temperature':
    case '1':
      speakCurrent('temp'); break;
    case 'feels like':
    case '2':
      speakCurrent('feels'); break;
    case 'condition':
    case '3':
      speakCurrent('desc'); break;
    case 'humidity':
    case '4':
      speakCurrent('humidity'); break;
    case 'wind':
    case '5':
      speakCurrent('wind'); break;
    case '5 day forecast':
    case '6':
      speakForecast(); break;
    case 'return home':
    case '7':
      window.location.href = "index.html"; break;
    default:
      speak("Command not recognized, please try again.");
  }
}

// ----------------------------
// Helper to read current data
// ----------------------------
function speakCurrent(field) {
  const value = document.querySelector(`[data-field="${field}"]`)?.textContent || 'Not available';
  speak(`${field.replace(/_/g,' ')}: ${value}`);
}

// ----------------------------
// Helper to read 5-day forecast
// ----------------------------
function speakForecast() {
  const items = document.querySelectorAll('#forecast-list li');
  items.forEach(li => {
    const day = li.querySelector('[data-day]').textContent;
    const hi = li.querySelector('[data-high]').textContent;
    const lo = li.querySelector('[data-low]').textContent;
    const desc = li.querySelector('[data-desc]').textContent;
    if(day && day !== '—') speak(`${day}: High ${hi}, Low ${lo}, ${desc}`);
  });
}

// ----------------------------
// Navbar buttons
// ----------------------------
document.getElementById('home-btn')?.addEventListener('click', () => window.location.href="index.html");
document.getElementById('settings-btn')?.addEventListener('click', () => window.location.href="settings.html");
document.getElementById('exit-btn')?.addEventListener('click', () => window.location.href="exit.html");

// ----------------------------
// Auto-start voice on page load
// ----------------------------
window.addEventListener('DOMContentLoaded', () => {
  greetWeather();
  startVoiceRecognition();
});
