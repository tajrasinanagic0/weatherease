const synth = window.speechSynthesis;
let recognition;

function speak(text) {
  if (synth.speaking) synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  synth.speak(utter);
}

function startVoiceRecognition() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
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
  recognition.onend = () => recognition.start();
}

function handleVoiceCommand(cmd) {
  const page = window.location.pathname.split('/').pop();

  if (page.includes('index.html')) {
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
      default: speak("Command not recognized, say 1, 2 or 9."); break;
    }
  } else if (page.includes('weather.html')) {
    // weather page voice commands
    switch(cmd) {
      case '1': document.getElementById('get-temp-btn')?.click(); break;
      case '2': /* feels like */ break;
      case '3': /* condition */ break;
      case '4': /* humidity */ break;
      case '5': /* wind */ break;
      case '6': /* 5-day forecast */ break;
      case '7': window.location.href='index.html'; break;
      default: speak("Command not recognized, say 1-7."); break;
    }
  } else if (page.includes('exit.html')) {
    // nothing, app closed
  }
}

// Start voice system automatically
window.addEventListener('DOMContentLoaded', () => {
  speak("Welcome to WeatherEase! To enable voice features, press the voice toggle in settings.");
});
