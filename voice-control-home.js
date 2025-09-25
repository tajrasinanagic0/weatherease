// ----------------------------
// Voice & Speech System for Home Page
// ----------------------------
const synth = window.speechSynthesis;
let recognition;
const voiceStatus = document.getElementById('voice-status');

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
function greetHomeUser() {
  const greeting = `Welcome to WeatherEase!
To enable voice features, please allow microphone access.
Once enabled, here are your options:
1: Get Weather
2: Settings
9: Exit
To select, say the number or the option name.`;
  speak(greeting);
  if (voiceStatus) voiceStatus.textContent = "Listening for home commands...";
}

// ----------------------------
// Start voice recognition
// ----------------------------
function startHomeRecognition() {
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
    handleHomeCommand(command);
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
// Handle home commands
// ----------------------------
function handleHomeCommand(cmd) {
  switch(cmd) {
    case '1':
    case 'get weather':
    case 'weather':
      speak("Navigating to Weather page");
      window.location.href = "weather.html";
      break;
    case '2':
    case 'settings':
      speak("Navigating to Settings page");
      window.location.href = "settings.html";
      break;
    case '9':
    case 'exit':
      speak("Exiting app. Thank you for using WeatherEase, your easy breezy forecast!");
      window.location.href = "exit.html";
      break;
    default:
      speak("Command not recognized, please say 1, 2, or 9.");
      break;
  }
}

// ----------------------------
// Initialize on page load
// ----------------------------
window.addEventListener('DOMContentLoaded', () => {
  greetHomeUser();
  startHomeRecognition();
});
