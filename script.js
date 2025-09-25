const API_KEY = "YOUR_API_KEY_HERE";

document.addEventListener('DOMContentLoaded', ()=>{
  const status = document.getElementById('current-status');
  const forecastList = document.getElementById('forecast-list');

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
      status.textContent="Weather updated.";
    } catch(e){ status.textContent="Error fetching weather"; }
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
    } catch(e){ console.log(e); }
  }

  document.getElementById('geo-btn')?.addEventListener('click', ()=>{
    if(!navigator.geolocation) return alert("Geolocation not supported.");
    navigator.geolocation.getCurrentPosition(pos=>{
      fetchWeather(pos.coords.latitude,pos.coords.longitude);
      fetchForecast(pos.coords.latitude,pos.coords.longitude);
    });
  });

  document.getElementById('location-form')?.addEventListener('submit', e=>{
    e.preventDefault();
    const city = document.getElementById('search').value;
    if(!city) return alert("Enter city or ZIP");
  });

  document.getElementById('get-temp-btn')?.addEventListener('click', ()=>{
    const tempEl = document.querySelector('[data-field="temp"]');
    if(tempEl && tempEl.textContent!=='—') speak(`The current temperature is ${tempEl.textContent}`);
  });
});

function speak(text){
  if(window.speechSynthesis.speaking) window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

