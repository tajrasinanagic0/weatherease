const synth = window.speechSynthesis;
let recognition;
let locationConfirmed = false;
const voiceBtn = document.getElementById('enable-voice-btn');

function speak(text){
  if(synth.speaking) synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  synth.speak(utter);
}

function startWeatherVoice(){
  if(!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = (event) => {
    const cmd = event.results[0][0].transcript.trim().toLowerCase();
    handleWeatherCommand(cmd);
  };

  recognition.onerror = (event) => { console.error(event.error); };
  recognition.onend = () => { setTimeout(()=>recognition.start(),300); };
}

function greetWeatherUser(){
  speak("Welcome to WeatherEase Weather page. Please share your location or enter a city to begin.");
}

// Handle voice commands
function handleWeatherCommand(cmd){
  if(!locationConfirmed){
    if(cmd.includes("location") || cmd.includes("use my location")) {
      document.getElementById('geo-btn').click();
      locationConfirmed = true;
      setTimeout(() => listWeatherOptions(), 1000);
    } else if(cmd) {
      speak("Please share your location or type a city name.");
    }
    return;
  }

  switch(cmd){
    case '1':
    case 'temperature':
      speakCurrent('temp'); break;
    case '2':
    case 'feels like':
      speakCurrent('feels'); break;
    case '3':
    case 'condition':
      speakCurrent('desc'); break;
    case '4':
    case 'humidity':
      speakCurrent('humidity'); break;
    case '5':
    case 'wind':
      speakCurrent('wind'); break;
    case '6':
    case '5-day forecast':
      speakForecast(); break;
    case '7':
    case 'home':
      speak("Returning to home");
      window.location.href = "index.html"; break;
    default:
      speak("Command not recognized. Say a number from 1 to 7."); break;
  }
}

function listWeatherOptions(){
  const options = `Weather options: 
  1: Current temperature
  2: Feels like
  3: Condition
  4: Humidity
  5: Wind
  6: 5-day forecast
  7: Return home`;
  speak(options);
}

// Speak weather fields
function speakCurrent(field){
  const el = document.querySelector(`[data-field="${field}"]`);
  if(el && el.textContent!=='—') speak(`${field} is ${el.textContent}`);
  else speak(`${field} not available`);
}

function speakForecast(){
  const lis = document.querySelectorAll('#forecast-list li');
  if(!lis.length){ speak("No forecast available."); return; }
  let text = "5-day forecast: ";
  lis.forEach(li => {
    text += `${li.querySelector('[data-day]').textContent}, high ${li.querySelector('[data-high]').textContent}, low ${li.querySelector('[data-low]').textContent}, ${li.querySelector('[data-desc]').textContent}. `;
  });
  speak(text);
}

// Navbar buttons
document.getElementById('home-btn')?.addEventListener('click', ()=>window.location.href="index.html");
document.getElementById('settings-btn')?.addEventListener('click', ()=>window.location.href="settings.html");
document.getElementById('exit-btn')?.addEventListener('click', ()=>window.location.href="exit.html");

// Enable voice button
voiceBtn?.addEventListener('click', ()=>{ startWeatherVoice(); listWeatherOptions(); });

window.addEventListener('DOMContentLoaded', greetWeatherUser);
