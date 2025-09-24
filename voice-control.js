// ----------------------------
// Voice & Speech System Setup
// ----------------------------
const startVoiceBtn = document.getElementById('start-voice-btn');
const voiceStatus = document.getElementById('voice-status');
const synth = window.speechSynthesis;
let recognition;

// ----------------------------
// Speak function using SpeechSynthesis
// ----------------------------
function speak(text) {
  if (synth.speaking) synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  synth.speak(utter);
}

// ----------------------------
// Greeting and Home Options
// ----------------------------
function greetUser() {
  const greeting = `Welcome to WeatherEase! Here are your options: 
  Get Weather, Settings, and Exit. 
  To access Get Weather, say 1. 
  To access Settings, say 2. 
  To access Exit, say 9.`;
  speak(greeting);
  voiceStatus.textContent = "Awaiting voice command...";
}

// ----------------------------
// Start voice recognition (desktop browsers only)
// ----------------------------
function startVoiceRecognition() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    voiceStatus.textContent = "Voice commands not supported in this browser. Use buttons.";
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

  recognition.onend = () => {
    // Continuous listening
    recognition.start();
  };
}

// ----------------------------
// Map voice commands to actions
// ----------------------------
function handleVoiceCommand(command) {
  const cmd = command.toLowerCase();
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
      speak("Exiting app");
      window.location.href = "exit.html";
      break;
    default:
      speak("Command not recognized, please try again.");
      break;
  }
}

// ----------------------------
// Button events
// ----------------------------
startVoiceBtn?.addEventListener('click', () => {
  greetUser();
  startVoiceRecognition();
});

document.getElementById('get-weather-btn')?.addEventListener('click', () => {
  window.location.href = "weather.html";
});
document.getElementById('settings-btn')?.addEventListener('click', () => {
  window.location.href = "settings.html";
});
document.getElementById('exit-btn')?.addEventListener('click', () => {
  window.location.href = "exit.html";
});




