import { useState, useRef, useEffect, useCallback } from 'react';
import { apiAiService } from '../services/apiAiService.js';
import { useToast } from '../context/ToastContext.jsx';

export function useVoiceRecorder(onTranscriptionSuccess, languageHint = 'AUTO') {
  const { addToast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const audioChunksRef = useRef([]);
  const activeStreamRef = useRef(null);
  const pressStartTimeRef = useRef(0);
  const isWebSpeechSupported = typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    return () => {
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch (e) {}
      }
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const stopRecording = useCallback(() => {
    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch (e) {}
      speechRecognitionRef.current = null;
      setIsRecording(false);
      return;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
      setIsRecording(false);
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (isRecording || isTranscribing) return;

    if (isWebSpeechSupported) {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        speechRecognitionRef.current = recognition;
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = languageHint === 'MR' ? 'mr-IN' : languageHint === 'HI' ? 'hi-IN' : 'en-US';

        recognition.onstart = () => {
          setIsRecording(true);
          addToast('Listening... Speak now', 'info');
        };

        recognition.onresult = (event) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript.trim()) {
            onTranscriptionSuccess(transcript.trim());
          }
        };

        recognition.onerror = (err) => {
          console.warn('[WebSpeech Error]:', err);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
        return;
      } catch (err) {
        console.warn('SpeechRecognition start failed, falling back to MediaRecorder:', err);
      }
    }

    // MediaRecorder Fallback
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      activeStreamRef.current = stream;
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) audioChunksRef.current.push(ev.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setIsTranscribing(true);
        addToast('Transcribing voice...', 'info');

        try {
          const res = await apiAiService.voiceToText(audioBlob, languageHint);
          const text = res?.data?.text || res?.text;
          if (text) {
            onTranscriptionSuccess(text);
            addToast('Transcribed!', 'success');
          } else {
            addToast('Could not transcribe audio.', 'warning');
          }
        } catch (err) {
          console.error('[VoiceToText Error]:', err);
          addToast('Voice transcription failed.', 'error');
        } finally {
          setIsTranscribing(false);
          if (activeStreamRef.current) {
            activeStreamRef.current.getTracks().forEach((track) => track.stop());
            activeStreamRef.current = null;
          }
        }
      };

      recorder.start();
      setIsRecording(true);
      addToast('Listening... Speak now.', 'info');
    } catch (err) {
      console.error('Microphone permission error:', err);
      addToast('Please allow microphone permissions.', 'error');
    }
  }, [isRecording, isTranscribing, isWebSpeechSupported, languageHint, onTranscriptionSuccess, addToast]);

  const toggleRecording = useCallback((e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const holdTimerRef = useRef(null);
  const isHoldModeRef = useRef(false);

  const handlePointerDown = (e) => {
    pressStartTimeRef.current = Date.now();
    isHoldModeRef.current = false;

    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    holdTimerRef.current = setTimeout(() => {
      isHoldModeRef.current = true;
      if (!isRecording) {
        startRecording();
      }
    }, 300);
  };

  const handlePointerUp = (e) => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    const pressDuration = Date.now() - pressStartTimeRef.current;
    if (isHoldModeRef.current || pressDuration > 300) {
      if (isRecording) {
        stopRecording();
      }
    }
  };

  const handleClick = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    const pressDuration = Date.now() - pressStartTimeRef.current;

    if (!isHoldModeRef.current && pressDuration <= 300) {
      toggleRecording(e);
    }
    isHoldModeRef.current = false;
  };

  const bindMicProps = {
    onClick: handleClick,
    onMouseDown: handlePointerDown,
    onMouseUp: handlePointerUp,
    onTouchStart: handlePointerDown,
    onTouchEnd: handlePointerUp,
  };

  return {
    isRecording,
    isTranscribing,
    startRecording,
    stopRecording,
    toggleRecording,
    bindMicProps,
  };
}
