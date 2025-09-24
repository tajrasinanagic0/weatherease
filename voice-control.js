const voiceStatus = document.getElementById('voice-status');
let recognition;

function speak(text) {
  const synth = window.speechSynthesis;
  if(synth.speaking) synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  synth.speak(utter);
}

function startVoiceRecognition() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    if(voiceStatus) voiceStatus.textContent = "Speech recognition not supported.";
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  if(voiceStatus) voiceStatus.textContent = "Listening for commands…";
  recognition.start();

  recognition.onresult = (event) => {
    const command = event.results[0][0].transcript.trim().toLowerCase();
    handleVoiceCommand(command);
  };

  recognition.onerror = (event) => {
    console.error(event.error);
    if(voiceStatus) voiceStatus.textContent = `Error: ${event.error}`;
  };

  recognition.onend = () => {
    recognition.start(); // keep listening
  };
}

function handleVoiceCommand(cmd) {
  // Home page commands
  if(document.location.pathname.endsWith("index.html")){
    switch(cmd){
      case "1":
      case "get weather":
        speak("Navigating to Weather page");
        window.location.href = "weather.html";
        break;
      case "2":
      case "settings":
        speak("Navigating to Settings");
        window.location.href = "settings.html";
        break;
      case "9":
      case "exit":
        speak("Exiting app");
        window.location.href = "exit.html";
        break;
      default:
        speak("Command not recognized. Say 1 for Weather, 2 for Settings, 9 for Exit.");
        break;
    }
  }

  // Weather page commands
  if(document.location.pathname.endsWith("weather.html")){
    switch(cmd){
      case "1": document.getElementById('get-temp-btn')?.click(); speak("Getting temperature"); break;
      case "2": speak("Currently feels like: " + document.querySelector('[data-field="feels"]')?.textContent); break;
      case "3": speak("Condition: " + document.querySelector('[data-field="desc"]')?.textContent); break;
      case "4": speak("Humidity: " + document.querySelector('[data-field="humidity"]')?.textContent); break;
      case "5": speak("Wind: " + document.querySelector('[data-field="wind"]')?.textContent); break;
      case "6": // read 5-day forecast
        document.querySelectorAll('#forecast-list li').forEach(li => {
          const day = li.querySelector('[data-day]').textContent;
          const high = li.querySelector('[data-high]').textContent;
          const low = li.querySelector('[data-low]').textContent;
          const desc = li.querySelector('[data-desc]').textContent;
          speak(`${day}: High ${high}, Low ${low}, ${desc}`);
        });
        break;
      case "7":
        speak("Returning to home");
        window.location.href = "index.html";
        break;
      default:
        speak("Command not recognized, say 1 to 7.");
        break;
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  // Auto start if localStorage voice enabled
  if(localStorage.getItem('voiceEnabled') === "true"){
    startVoiceRecognition();
    if(voiceStatus) voiceStatus.textContent = "Voice commands enabled";
  }

  // Settings checkbox hookup
  const voiceCheckbox = document.getElementById('voice');
  if(voiceCheckbox){
    voiceCheckbox.checked = localStorage.getItem('voiceEnabled') === "true";
    voiceCheckbox.addEventListener('change', () => {
      if(voiceCheckbox.checked){
        localStorage.setItem('voiceEnabled', 'true');
        startVoiceRecognition();
        if(voiceStatus) voiceStatus.textContent = "Voice commands enabled";
      } else {
        localStorage.setItem('voiceEnabled', 'false');
        if(recognition) recognition.stop();
        if(voiceStatus) voiceStatus.textContent = "Voice commands disabled";
      }
    });
  }
});

