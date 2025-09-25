const API_KEY = "2c1fb322de5c86e87d6eb7e265fe9f32"; // <-- Put your OpenWeather API key here
const synth = window.speechSynthesis;

let recognition;
let voiceEnabled = false;

// DOM Elements
const voiceBtn = document.getElementById('enable-voice-btn');
const voiceStatus = document.getElementById('current-status');

const geoBtn = document.getElementById('geo-btn');
const forecastList = document.getElementById('forecast-list');

const homeBtn = document.getElementById('home-btn');
const settingsBtn = document.getElementById('settings-btn');
const exitBtn = document.getElementById('exit-btn');

// ----------------------------
// Speak function
// ----------------------------
function speak(text){
  if(!voiceEnabled) return;
  if(synth.speaking) synth.cancel();
  synth.speak(new SpeechSynthesisUtterance(text));
}

// ----------------------------
// Navbar
// ----------------------------
homeBtn.addEventListener('click', ()=>navigate('index.html','Returning to home screen'));
settingsBtn.addEventListener('click', ()=>navigate('settings.html','Opening settings'));
exitBtn.addEventListener('click', ()=>navigateExit());

function navigate(url,message){
  speak(message);
  setTimeout(()=>window.location.href=url,500);
}

function navigateExit(){
  speak("Thank you for using WeatherEase. Closing app now.");
  setTimeout(()=>window.close(),3000);
}

// ----------------------------
// Enable voice
// ----------------------------
voiceBtn.addEventListener('click', ()=>{
  voiceEnabled = true;
  speak("Voice features enabled. Listening for commands.");
  startRecognition();
  greetUser();
  voiceBtn.style.display="none";
});

// ----------------------------
// Greeting
// ----------------------------
function greetUser(){
  speak(`Welcome to WeatherEase Weather page! Press "Use My Location" to get your current weather.
Once location is available, say:
1 for temperature, 2 for feels like, 3 for condition, 4 for humidity, 5 for wind, 6 for 5 day forecast, 7 to return home.`);
}

// ----------------------------
// Voice Recognition
// ----------------------------
function startRecognition(){
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

  recognition.onresult=(e)=>{
    const cmd = e.results[0][0].transcript.trim().toLowerCase();
    console.log("Heard:",cmd);
    handleCommand(cmd);
  };

  recognition.onerror=(e)=>{
    console.error(e.error);
    voiceStatus.textContent=`Error: ${e.error}`;
  };

  recognition.onend=()=>{
    if(voiceEnabled) recognition.start();
  };
}

// ----------------------------
// Handle Commands
// ----------------------------
function handleCommand(cmd){
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
      navigate('index.html','Returning home'); break;
    default:
      speak("Command not recognized. Please try again."); break;
  }
}

// ----------------------------
// Speak current weather
// ----------------------------
function speakCurrent(field){
  const el = document.querySelector(`[data-field="${field}"]`);
  if(el && el.textContent !== '—'){
    speak(`${field.replace('-',' ')} is ${el.textContent}`);
  } else speak(`${field} is not available yet`);
}

// ----------------------------
// Speak 5-day forecast
// ----------------------------
function speakForecast(){
  const days = [...forecastList.querySelectorAll('li')];
  if(!days.length){ speak("No forecast data available."); return; }
  let text="Here is your 5-day forecast: ";
  days.forEach(li=>{
    const day = li.querySelector('[data-day]')?.textContent || '—';
    const high = li.querySelector('[data-high]')?.textContent || '—';
    const low = li.querySelector('[data-low]')?.textContent || '—';
    const desc = li.querySelector('[data-desc]')?.textContent || '—';
    text += `${day}: High ${high}, Low ${low}, ${desc}. `;
  });
  speak(text);
}

// ----------------------------
// Fetch weather by coordinates
// ----------------------------
async function fetchWeather(lat,lon){
  try{
    const resp = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
    const data = await resp.json();
    document.querySelector('[data-field="place"]').textContent = `${data.name}, ${data.sys.country}`;
    document.querySelector('[data-field="temp"]').textContent = Math.round(data.main.temp)+'°C';
    document.querySelector('[data-field="feels"]').textContent = Math.round(data.main.feels_like)+'°C';
    document.querySelector('[data-field="desc"]').textContent = data.weather[0].description;
    document.querySelector('[data-field="humidity"]').textContent = data.main.humidity+'%';
    document.querySelector('[data-field="wind"]').textContent = data.wind.speed+' m/s';
    currentStatus.textContent="Weather updated.";
    fetchForecast(lat,lon);
  } catch(e){ speak("Error fetching weather"); console.log(e); }
}

// ----------------------------
// Fetch 5-day forecast
// ----------------------------
async function fetchForecast(lat,lon){
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
  } catch(e){ console.log(e); }
}

// ----------------------------
// Geolocation button
// ----------------------------
geoBtn.addEventListener('click', ()=>{
  if(!navigator.geolocation){ speak("Geolocation not supported"); return; }
  navigator.geolocation.getCurrentPosition(pos=>{
    fetchWeather(pos.coords.latitude,pos.coords.longitude);
  }, err=>{
    speak("Unable to get location. Please allow location access.");
  });
});
