const startVoiceBtns = document.querySelectorAll('#start-voice-btn');
const voiceStatus = document.getElementById('voice-status');
const synth = window.speechSynthesis;
let recognition;

function speak(text){
  if(synth.speaking) synth.cancel();
  synth.speak(new SpeechSynthesisUtterance(text));
}

function greetUser(){
  speak(`Welcome to WeatherEase! 
To enable voice features press the button.
Options: Get Weather, Settings, Exit.
Say 1 for Get Weather, 2 for Settings, 9 for Exit.`);
}

function startVoiceRecognition(){
  if(!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)){
    voiceStatus.textContent="Speech recognition not supported.";
    return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang='en-US';
  recognition.interimResults=false;
  recognition.maxAlternatives=1;
  recognition.start();
  recognition.onresult=(event)=>{
    const cmd = event.results[0][0].transcript.trim().toLowerCase();
    handleCommand(cmd);
  };
  recognition.onerror=(e)=>{ voiceStatus.textContent=`Error: ${e.error}`; }
  recognition.onend=()=>{ recognition.start(); }
}

function handleCommand(cmd){
  switch(cmd){
    case '1':
    case 'get weather': window.location.href='weather.html'; break;
    case '2':
    case 'settings': window.location.href='settings.html'; break;
    case '9':
    case 'exit': window.location.href='exit.html'; break;
    default: speak("Command not recognized.");
  }
}

startVoiceBtns.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    greetUser();
    startVoiceRecognition();
  });
});




