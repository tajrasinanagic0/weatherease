// ----------------------------
// Home Page Voice & Navigation
// ----------------------------
const startVoiceBtn = document.getElementById('start-voice-btn');
const voiceStatus = document.getElementById('voice-status');
const synth = window.speechSynthesis;
let recognition;

// ----------------------------
// Speak text aloud
// ----------------------------
function speak(text) {
  if(synth.speaking) synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  synth.speak(utter);
}

// ----------------------------
// Greeting instructions
// ----------------------------
function greetUser() {
  const greeting = `Welcome to WeatherEase!
To enable voice features press the Start Voice Features button.
Once enabled, you can say:
1: Get Weather
2: Settings
9: Exit`;
  speak(greeting);
  voiceStatus.textContent = "Awaiting voice command...";
}

// ----------------------------
// Voice recognition
// ----------------------------
function startVoiceRecognition() {
  if(!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    voiceStatus.textContent = "Voice commands not supported.";
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
    handleVoiceCommand(command);
  };

  recognition.onerror = (event) => {
    voiceStatus.textContent = `Error: ${event.error}`;
  };

  recognition.onend = () => { setTimeout(()=>recognition.start(), 300); };
}

// ----------------------------
// Map voice commands to actions
// ----------------------------
function handleVoiceCommand(cmd) {
  switch(cmd) {
    case '1':
    case 'get weather':
      speak("Navigating to Weather page");
      window.location.href = "weather.html"; break;
    case '2':
    case 'settings':
      speak("Navigating to Settings");
      window.location.href = "settings.html"; break;
    case '9':
    case 'exit':
      speak("Exiting app");
      window.location.href = "exit.html"; break;
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

document.getElementById('get-weather-btn')?.addEventListener('click', ()=>{ window.location.href = "weather.html"; });
document.getElementById('settings-btn')?.addEventListener('click', ()=>{ window.location.href = "settings.html"; });
document.getElementById('exit-btn')?.addEventListener('click', ()=>{ window.location.href = "exit.html"; });
