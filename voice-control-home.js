const startVoiceBtn = document.querySelectorAll('#start-voice-btn');
const voiceStatus = document.querySelectorAll('#voice-status');
const synth = window.speechSynthesis;
let recognition;

function speak(text){
  if(synth.speaking) synth.cancel();
  synth.speak(new SpeechSynthesisUtterance(text));
}

function startRecognition(){
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.start();

  recognition.onresult = e=>{
    const cmd = e.results[0][0].transcript.trim().toLowerCase();
    handleCommand(cmd);
  };
  recognition.onend = ()=> recognition.start();
}

function handleCommand(cmd){
  switch(cmd){
    case '1':
    case 'get weather':
      speak("Navigating to Weather");
      window.location.href="weather.html";
      break;
    case '2':
    case 'settings':
      speak("Navigating to Settings");
      window.location.href="settings.html";
      break;
    case '9':
    case 'exit':
      speak("Exiting app");
      window.location.href="exit.html";
      break;
    default:
      speak("Command not recognized, please try again.");
  }
}

// Attach to all start voice buttons
startVoiceBtn.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    speak("Voice commands enabled. Say 1 for Get Weather, 2 for Settings, 9 for Exit.");
    startRecognition();
  });
});

// Home buttons
document.getElementById('get-weather-btn')?.addEventListener('click', ()=>window.location.href="weather.html");
document.getElementById('settings-btn')?.addEventListener('click', ()=>window.location.href="settings.html");
document.getElementById('exit-btn')?.addEventListener('click', ()=>window.location.href="exit.html");
document.getElementById('home-btn')?.addEventListener('click', ()=>window.location.href="index.html");
document.getElementById('weather-btn')?.addEventListener('click', ()=>window.location.href="weather.html");

