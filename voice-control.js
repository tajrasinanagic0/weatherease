// =========================
// Home Page Voice + Buttons
// =========================
window.addEventListener('DOMContentLoaded', () => {
  const startVoiceBtn = document.getElementById('start-voice-btn');
  const voiceStatus = document.getElementById('voice-status');
  const synth = window.speechSynthesis;
  let recognition;

  // ----------------------------
  // Speak text
  // ----------------------------
  function speak(text) {
    if (synth.speaking) synth.cancel(); // Stop any ongoing speech
    const utter = new SpeechSynthesisUtterance(text);
    synth.speak(utter);
  }

  // ----------------------------
  // Greet user
  // ----------------------------
  function greetUser() {
    const greeting = `Welcome to WeatherEase!
Press Start Voice Features to use voice commands.
Say 1: Get Weather
Say 2: Settings
Say 9: Exit`;
    speak(greeting);
    voiceStatus.textContent = "Awaiting voice command...";
  }

  // ----------------------------
  // Start voice recognition
  // ----------------------------
  function startVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      voiceStatus.textContent = "Voice commands not supported in this browser.";
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.trim().toLowerCase();
      handleVoiceCommand(command);
    };

    recognition.onerror = (event) => {
      voiceStatus.textContent = `Error: ${event.error}`;
    };

    recognition.onend = () => { setTimeout(() => recognition.start(), 300); };
  }

  // ----------------------------
  // Handle voice commands
  // ----------------------------
  function handleVoiceCommand(cmd) {
    switch(cmd){
      case '1': case 'get weather':
        speak("Opening Weather page");
        window.location.href = "weather.html";
        break;
      case '2': case 'settings':
        speak("Opening Settings page");
        window.location.href = "settings.html";
        break;
      case '9': case 'exit':
        speak("Exiting app");
        window.location.href = "exit.html";
        break;
      default:
        speak("Command not recognized, please try again.");
    }
  }

  // ----------------------------
  // Button click events
  // ----------------------------
  startVoiceBtn?.addEventListener('click', () => {
    greetUser();
    startVoiceRecognition();
  });

  document.getElementById('get-weather-btn')?.addEventListener('click', () => window.location.href = "weather.html");
  document.getElementById('settings-btn')?.addEventListener('click', () => window.location.href = "settings.html");
  document.getElementById('exit-btn')?.addEventListener('click', () => window.location.href = "exit.html");
});

