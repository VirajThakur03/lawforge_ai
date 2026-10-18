// src/phase4/voice-agent/VoiceProcessor.js

export class VoiceProcessor {
  constructor(onResult, onError, onEnd) {
    this.recognition = null;
    this.isListening = false;
    this.onResult = onResult;
    this.onError = onError;
    this.onEnd = onEnd;
    
    this.init();
  }

  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech API not supported in this browser.");
      return;
    }
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    
    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      this.onResult(finalTranscript, interimTranscript);
    };

    this.recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      if (this.onError) this.onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEnd) this.onEnd();
    };
  }

  start(i18nLanguage = 'en') {
    if (!this.recognition) {
      if (this.onError) this.onError("not-supported");
      return;
    }
    
    // Map i18n lang to BCP47
    const langMap = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'mr': 'mr-IN'
    };
    this.recognition.lang = langMap[i18nLanguage] || 'en-US';
    
    try {
      this.recognition.start();
      this.isListening = true;
    } catch (e) {
      console.error(e);
      if (this.onError) this.onError(e.message);
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}
