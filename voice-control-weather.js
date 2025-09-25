const synth = window.speechSynthesis;
let recognition;
let locationConfirmed = false;

// Speak helper
function speak(text){
  if(synth.speaking) synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  synth.speak(utter);
}

// Start recognition
function startWeatherRecognition(){
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
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

  recognition.onerror = (e)=> console.log(e);
  recognition.onend = ()=> recognition.start();
}

// Weather option menu (1–7)
function promptWeatherOptions(){
  speak(`Choose an option:
1: Current temperature
2: Feels like
3: Condition
4: Humidity
5: Wind
6: 5-day forecast
7: Return home`);
}

// Handle commands
function handleWeatherCommand(cmd){
  if(!locationConfirmed){
    // Expecting city name
    if(cmd.includes('location') || cmd.includes('city')){
      // Trigger geolocation or city input logic
      if(cmd.includes('location')){
        document.getElementById('geo-btn').click();
      } else {
        const cityInput = document.getElementById('search').value;
        if(cityInput) fetchCityWeather(cityInput);
      }
      return;
    }
    speak("Please share your location or enter a city name first.");
    return;
  }

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
      speak("Returning home");
      window.location.href="index.html";
      break;
    default:
      speak("Command not recognized, please try again.");
      break;
  }
}

// Fetch weather for city
function fetchCityWeather(city){
  // Use your existing API logic here
  speak(`Fetching weather for ${city}`);
  locationConfirmed = true;
  promptWeatherOptions();
}

// Speak individual fields
function speakCurrent(field){
  const el = document.querySelector(`[data-field="${field}"]`);
  if(el && el.textContent !== '—'){
    speak(`${field.replace('-', ' ')} is ${el.textContent}`);
  } else speak(`Sorry, ${field} not available`);
}

// Speak 5-day forecast
function speakForecast(){
  const liNodes = document.querySelectorAll('#forecast-list li');
  if(!liNodes.length){ speak("No forecast available"); return; }

  let text = "Here is your 5-day forecast: ";
  liNodes.forEach(li=>{
    text += `${li.querySelector('[data-day]').textContent}: High ${li.querySelector('[data-high]').textContent}, Low ${li.querySelector('[data-low]').textContent}, ${li.querySelector('[data-desc]').textContent}. `;
  });
  speak(text);
}

// Setup buttons
document.getElementById('geo-btn')?.addEventListener('click', ()=>{
  if(!navigator.geolocation) return alert("Geolocation not supported.");
  navigator.geolocation.getCurrentPosition(pos=>{
    fetchWeather(pos.coords.latitude, pos.coords.longitude);
    fetchForecast(pos.coords.latitude, pos.coords.longitude);
    locationConfirmed = true;
    promptWeatherOptions();
  });
});

document.getElementById('location-form')?.addEventListener('submit', e=>{
  e.preventDefault();
  const city = document.getElementById('search').value;
  if(city) fetchCityWeather(city);
});

// Start recognition on page load
window.addEventListener('DOMContentLoaded', ()=>{
  startWeatherRecognition();
  speak("Welcome to WeatherEase Weather page. Please share your location or enter a city.");
});

