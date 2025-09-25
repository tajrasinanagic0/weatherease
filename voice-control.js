const startVoiceBtn = document.getElementById('start-voice-btn');
const voiceStatus = document.getElementById('voice-status');
const synth = window.speechSynthesis;
let recognition;

function speak(text){
  if(synth.speaking) synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  synth.speak(utter);
}

// --- Greeting & Voice Recognition ---
function greetUser(){
  speak("Welcome to WeatherEase! To enable voice features, press the button or volume up twice.");
  voiceStatus.textContent = "Awaiting voice command...";
}

function startVoiceRecognition(){
  if(!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)){
    voiceStatus.textContent = "Voice not supported, use buttons.";
    return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = (event)=>{
    const cmd = event.results[0][0].transcript.trim().toLowerCase();
    handleVoiceCommand(cmd);
  };

  recognition.onerror = (event)=>{
    voiceStatus.textContent = `Error: ${event.error}`;
  };

  recognition.onend = ()=>{
    recognition.start();
  };
}

// --- Map Voice Commands ---
function handleVoiceCommand(cmd){
  switch(cmd){
    case '1':
    case 'get weather':
      speak("Opening Weather page");
      window.location.href = "weather.html";
      break;
    case '2':
    case 'settings':
      speak("Opening Settings page");
      window.location.href = "settings.html";
      break;
    case '9':
    case 'exit':
      speak("Exiting app");
      window.location.href = "exit.html";
      break;
    default:
      speak("Command not recognized, please try again.");
  }
}

// --- Buttons ---
startVoiceBtn?.addEventListener('click', ()=>{
  greetUser();
  startVoiceRecognition();
});

document.getElementById('get-weather-btn')?.addEventListener('click', ()=> window.location.href="weather.html");
document.getElementById('settings-btn')?.addEventListener('click', ()=> window.location.href="settings.html");
document.getElementById('exit-btn')?.addEventListener('click', ()=> window.location.href="exit.html");
document.getElementById('home-btn')?.addEventListener('click', ()=> window.location.href="index.html");
document.getElementById('weather-btn')?.addEventListener('click', ()=> window.location.href="weather.html");




