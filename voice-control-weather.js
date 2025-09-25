const synth = window.speechSynthesis;
let recognition;

function speak(text){
  if(synth.speaking) synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  synth.speak(utter);
}

function greetWeatherUser(){
  const greeting = `Welcome to WeatherEase Weather page!
To access weather, share your location or say a city.
Then choose an option:
1: Current temperature
2: Feels like
3: Condition
4: Humidity
5: Wind
6: 5-day forecast
7: Return home`;
  speak(greeting);
  document.getElementById('voice-status').textContent = "Listening for weather commands...";
}

function startWeatherRecognition(){
  if(!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)){
    document.getElementById('voice-status').textContent = "Speech recognition not supported.";
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
    handleWeatherCommand(cmd);
  };
  recognition.onerror = (event)=> console.error(event.error);
  recognition.onend = ()=> recognition.start();
}

function handleWeatherCommand(cmd){
  switch(cmd){
    case '1':
    case 'temperature':
      readField('temp'); break;
    case '2':
    case 'feels like':
      readField('feels'); break;
    case '3':
    case 'condition':
      readField('desc'); break;
    case '4':
    case 'humidity':
      readField('humidity'); break;
    case '5':
    case 'wind':
      readField('wind'); break;
    case '6':
    case '5-day forecast':
      readForecast(); break;
    case '7':
    case 'home':
      speak("Returning home");
      window.location.href="index.html"; break;
    default:
      speak("Command not recognized, please try again.");
  }
}

function readField(field){
  const el = document.querySelector(`[data-field="${field}"]`);
  if(el && el.textContent!=='—') speak(`${field.replace('-', ' ')} is ${el.textContent}`);
  else speak(`Sorry, ${field} is not available`);
}

function readForecast(){
  const days = document.querySelectorAll('#forecast-list li');
  if(!days.length){ speak("No forecast data"); return; }
  let text = "5-day forecast: ";
  days.forEach(li=>{
    text += `${li.querySelector('[data-day]').textContent}, high ${li.querySelector('[data-high]').textContent}, low ${li.querySelector('[data-low]').textContent}, ${li.querySelector('[data-desc]').textContent}. `;
  });
  speak(text);
}

document.addEventListener('DOMContentLoaded', ()=>{
  greetWeatherUser();
  startWeatherRecognition();

  // Navbar buttons
  document.getElementById('home-btn')?.addEventListener('click', ()=> window.location.href="index.html");
  document.getElementById('settings-btn')?.addEventListener('click', ()=> window.location.href="settings.html");
  document.getElementById('exit-btn')?.addEventListener('click', ()=> window.location.href="exit.html");
  document.getElementById('start-voice-btn')?.addEventListener('click', ()=> startWeatherRecognition());
});