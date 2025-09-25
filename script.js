// ----------------------------
// WeatherEase — Voice + Weather
// ----------------------------
const API_KEY = "2c1fb322de5c86e87d6eb7e265fe9f32";
const synth = window.speechSynthesis;
let recognition;
let voiceEnabled = false;

// DOM Elements
const voiceBtn = document.getElementById('enable-voice-btn');
const geoBtn = document.getElementById('geo-btn');
const forecastList = document.getElementById('forecast-list');
const currentStatus = document.getElementById('current-status');

// Navbar
document.getElementById('home-btn')?.addEventListener('click', ()=> navigateHome());
document.getElementById('settings-btn')?.addEventListener('click', ()=> navigateSettings());
document.getElementById('exit-btn')?.addEventListener('click', ()=> navigateExit());

// ----------------------------
// Speak function
// ----------------------------
function speak(text){
  if (!voiceEnabled) return;
  if (synth.speaking) synth.cancel();
  synth.speak(new SpeechSynthesisUtterance(text));
}

// ----------------------------
// Navbar functions
// ----------------------------
function navigateHome(){ speak("Returning to home screen"); setTimeout(()=>window.location.href="index.html", 1500); }
function navigateSettings(){ speak("Opening settings"); setTimeout(()=>window.location.href="settings.html", 1500); }
function navigateExit(){ speak("Thank you for using WeatherEase. Closing app now."); setTimeout(()=>window.close(), 3000); }

// ----------------------------
// Enable Voice
// ----------------------------
voiceBtn?.addEventListener('click', ()=>{
  voiceEnabled = true;
  speak("Voice features enabled. Press the 'Use my location' button now to fetch your weather.");
  geoBtn.focus(); // assist blind users
  startRecognition();
  voiceBtn.style.display = "none";
});

// ----------------------------
// Start voice recognition
// ----------------------------
function startRecognition(){
  if(!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)){
    speak("Speech recognition not supported.");
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = (event)=>{
    const command = event.results[0][0].transcript.trim().toLowerCase();
    console.log("Voice command:", command);
    handleCommand(command);
  };

  recognition.onerror = (e)=> console.log(e);

  recognition.onend = ()=> { if(voiceEnabled) recognition.start(); }
}

// ----------------------------
// Voice command handler
// ----------------------------
function handleCommand(cmd){
  switch(cmd){
    case '1':
    case 'temperature':
    case 'current temperature':
      speakCurrent('temp');
      break;
    case '2':
    case 'feels like':
      speakCurrent('feels');
      break;
    case '3':
    case 'condition':
      speakCurrent('desc');
      break;
    case '4':
    case 'humidity':
      speakCurrent('humidity');
      break;
    case '5':
    case 'wind':
      speakCurrent('wind');
      break;
    case '6':
    case '5-day forecast':
      speakForecast();
      break;
    case '7':
    case 'home':
    case 'return home':
      navigateHome();
      break;
    default:
      if(cmd.includes('home')) navigateHome();
      else if(cmd.includes('settings')) navigateSettings();
      else if(cmd.includes('exit')) navigateExit();
      else speak("Command not recognized, please try again.");
      break;
  }
}

// ----------------------------
// Speak current weather
// ----------------------------
function speakCurrent(field){
  const el = document.querySelector(`[data-field="${field}"]`);
  if(el && el.textContent && el.textContent!=='—') speak(`${field.replace('-',' ')} is ${el.textContent}`);
  else speak(`${field} is not available yet`);
}

// ----------------------------
// Speak 5-day forecast
// ----------------------------
function speakForecast(){
  const days = [...forecastList.querySelectorAll('li')];
  if(!days.length){ speak("No forecast data available."); return; }
  let text = "Here is your 5-day forecast: ";
  days.forEach(li=>{
    const day = li.querySelector('[data-day]')?.textContent || '—';
    const high = li.querySelector('[data-high]')?.textContent || '—';
    const low = li.querySelector('[data-low]')?.textContent || '—';
    const desc = li.querySelector('[data-desc]')?.textContent || '—';
    text += `${day}, high ${high}, low ${low}, ${desc}. `;
  });
  speak(text);
}

// ----------------------------
// Fetch weather using geolocation
// ----------------------------
geoBtn?.addEventListener('click', ()=>{
  if(!navigator.geolocation){ speak("Geolocation not supported"); return; }
  speak("Fetching your location. Please allow location access.");
  navigator.geolocation.getCurrentPosition(pos=>{
    fetchWeather(pos.coords.latitude,pos.coords.longitude);
  }, err=>{
    speak("Location access denied. Cannot fetch weather.");
  });
});

// ----------------------------
// Fetch weather & forecast
// ----------------------------
async function fetchWeather(lat, lon){
  try{
    const resp = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
    const data = await resp.json();
    document.querySelector('[data-field="place"]').textContent = `${data.name}, ${data.sys.country}`;
    document.querySelector('[data-field="temp"]').textContent = Math.round(data.main.temp)+'°C';
    document.querySelector('[data-field="feels"]').textContent = Math.round(data.main.feels_like)+'°C';
    document.querySelector('[data-field="desc"]').textContent = data.weather[0].description;
    document.querySelector('[data-field="humidity"]').textContent = data.main.humidity+'%';
    document.querySelector('[data-field="wind"]').textContent = data.wind.speed+' m/s';
    if(currentStatus) currentStatus.textContent="Weather updated.";
    fetchForecast(lat, lon);
  } catch(e){ speak("Error fetching weather data"); console.log(e); }
}

async function fetchForecast(lat, lon){
  try{
    const resp = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
    const data = await resp.json();
    const days = [...forecastList.querySelectorAll('li')];
    for(let i=0;i<days.length;i++){
      const dayData = data.list[i*8];
      days[i].querySelector('[data-day]').textContent = new Date(dayData.dt*1000).toLocaleDateString('en-US',{weekday:'long'});
      days[i].querySelector('[data-high]').textContent = Math.round(dayData.main.temp_max)+'°C';
      days[i].querySelector('[data-low]').textContent = Math.round(dayData.main.temp_min)+'°C';
      days[i].querySelector('[data-desc]').textContent = dayData.weather[0].description;
    }
  } catch(e){ speak("Error fetching forecast"); console.log(e); }
}
