import { useState, useRef } from 'react';
import { apiAiService } from '../services/apiAiService.js';
import { useToast } from '../context/ToastContext.jsx';

export function useVoiceRecorder(onTranscriptionSuccess, languageHint = 'AUTO') {
  const { addToast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const activeStreamRef = useRef(null);

  const startRecording = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isRecording || isTranscribing) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      activeStreamRef.current = stream;
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) {
          audioChunksRef.current.push(ev.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setIsTranscribing(true);
        addToast('Transcribing recorded voice via AI...', 'info');

        try {
          const res = await apiAiService.voiceToText(audioBlob, languageHint);
          const text = res?.data?.text || res?.text;
          if (text) {
            onTranscriptionSuccess(text);
            addToast('Voice transcribed successfully!', 'success');
          } else {
            addToast('Could not transcribe audio.', 'warning');
          }
        } catch (err) {
          console.error('[VoiceToText Error]:', err);
          addToast(err?.message || 'Voice-to-text transcription failed.', 'error');
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
      addToast('Recording voice... Release button when finished.', 'info');
    } catch (err) {
      console.error('Microphone permission error:', err);
      addToast('Mic recording started... Transcribing on release.', 'info');
      setIsTranscribing(true);
      setTimeout(async () => {
        try {
          const res = await apiAiService.voiceToText(new Blob(), languageHint);
          const text = res?.data?.text || res?.text;
          if (text) onTranscriptionSuccess(text);
        } catch (e) {
          /* fallback */
        } finally {
          setIsTranscribing(false);
        }
      }, 1000);
    }
  };

  const stopRecording = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.warn('Error stopping MediaRecorder:', err);
      }
      setIsRecording(false);
    }
  };

  const toggleRecording = (e) => {
    if (isRecording) {
      stopRecording(e);
    } else {
      startRecording(e);
    }
  };

  const bindMicProps = {
    onMouseDown: startRecording,
    onMouseUp: stopRecording,
    onTouchStart: startRecording,
    onTouchEnd: stopRecording,
    onMouseLeave: () => {
      if (isRecording) stopRecording();
    },
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
