import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Music, Send, LoaderCircle, CheckCircle2, AlertCircle, Radio } from 'lucide-react';
import { encodeAudioBufferToWav } from '../../utils/wavEncoder.js';
import { apiPostService } from '../../services/apiPostService.js';
import { WaveformPlayer } from './WaveformPlayer.jsx';
import { InitialAvatar } from './InitialAvatar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { usePosts } from '../../context/PostContext.jsx';

function formatTimer(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

export function CommunityComposer({ onPostPublished, onOpenSongUpload }) {
  const { currentUser } = useAuth();
  const { refreshPosts } = usePosts();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [voiceBlob, setVoiceBlob] = useState(null);
  const [voiceUrl, setVoiceUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (voiceUrl) URL.revokeObjectURL(voiceUrl);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [voiceUrl]);

  // Start Voice Recording
  const startRecording = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const rawBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });

        try {
          // Decode raw audio & convert to standard PCM WAV binary
          const arrayBuffer = await rawBlob.arrayBuffer();
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          audioContextRef.current = audioCtx;
          const decodedAudio = await audioCtx.decodeAudioData(arrayBuffer);
          const wavBlob = encodeAudioBufferToWav(decodedAudio);
          const wavFileUrl = URL.createObjectURL(wavBlob);

          setVoiceBlob(wavBlob);
          setVoiceUrl(wavFileUrl);
        } catch (err) {
          console.warn('WAV conversion fallback, using raw blob:', err);
          setVoiceBlob(rawBlob);
          setVoiceUrl(URL.createObjectURL(rawBlob));
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordSeconds((prev) => {
          if (prev >= 299) {
            stopRecording();
            return 300;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      setErrorMessage('Microphone access denied or audio recording failed.');
    }
  };

  // Stop Voice Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  // Discard Recorded Voice Note
  const discardRecording = () => {
    if (voiceUrl) URL.revokeObjectURL(voiceUrl);
    setVoiceBlob(null);
    setVoiceUrl(null);
    setRecordSeconds(0);
  };

  // Submit Voice Note Post (Strictly requires audio recording)
  const handleSubmit = async (event) => {
    event.preventDefault();

    // ENFORCE: Music Community posts require an audio recording.
    if (!voiceBlob) {
      setErrorMessage('Music Community posts require an audio recording. Please record a voice note to post.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      const file = new File([voiceBlob], 'recording.wav', { type: 'audio/wav' });
      formData.append('file', file);
      if (title.trim()) formData.append('title', title.trim());
      if (content.trim()) formData.append('caption', content.trim());
      formData.append('topic', 'GENERAL');
      formData.append('mood', 'NEUTRAL');
      formData.append('isMusicCommunity', 'true');

      await apiPostService.publishVoiceNote(formData);
      await refreshPosts();
      setSuccessMessage('Voice note published successfully to Music Community feed!');

      setContent('');
      setTitle('');
      discardRecording();
      if (onPostPublished) onPostPublished();
    } catch (err) {
      const message = err?.message || err?.userMessage || 'Failed to publish voice note. Content moderation error or network failure.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="community-composer-card">
      <form onSubmit={handleSubmit}>
        <div className="composer-input-wrapper">
          <InitialAvatar
            className="composer-author-avatar"
            name={currentUser?.username || currentUser?.fullName}
            src={currentUser?.avatarUrl || currentUser?.avatar}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <textarea
              className="composer-textarea"
              rows={2}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share thoughts on your recording with the Music Community..."
              disabled={isSubmitting}
            />

            {!voiceBlob && (
              <div style={{ fontSize: 12, color: '#888', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Radio size={14} color="#6f405f" />
                <span>Audio recording required to post in Music Community.</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Recording Counter Bar */}
        {isRecording && (
          <div className="composer-recording-bar">
            <div className="recording-pulse" />
            <span className="recording-timer">Recording: {formatTimer(recordSeconds)}</span>
            <button className="composer-stop-btn" type="button" onClick={stopRecording}>
              <Square size={14} fill="currentColor" /> Stop
            </button>
          </div>
        )}

        {/* Recorded Voice Preview */}
        {voiceBlob && voiceUrl && !isRecording && (
          <div className="composer-voice-preview">
            <div className="composer-voice-header">
              <span className="preview-label">Voice Note Preview ({recordSeconds}s)</span>
              <button className="composer-discard-btn" type="button" onClick={discardRecording}>
                <Trash2 size={15} /> Remove
              </button>
            </div>
            <WaveformPlayer audioUrl={voiceUrl} durationSeconds={recordSeconds} title="Voice Note Preview" />
          </div>
        )}

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="composer-alert composer-alert-error">
            <AlertCircle size={16} /> {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="composer-alert composer-alert-success">
            <CheckCircle2 size={16} /> {successMessage}
          </div>
        )}

        {/* Action Controls Footer */}
        <div className="composer-actions-bar">
          <div className="composer-actions-left">
            {!isRecording && !voiceBlob && (
              <button
                className="composer-tool-btn"
                type="button"
                onClick={startRecording}
                disabled={isSubmitting}
                title="Record voice note"
              >
                <Mic size={18} /> Record Voice
              </button>
            )}

            <button
              className="composer-tool-btn"
              type="button"
              onClick={onOpenSongUpload}
              disabled={isSubmitting || Boolean(voiceBlob)}
              title={voiceBlob ? 'Cannot upload song while recording voice note' : 'Upload community song'}
            >
              <Music size={18} /> Upload Song
            </button>
          </div>

          <button
            className="composer-submit-btn"
            type="submit"
            disabled={isSubmitting || isRecording || !voiceBlob}
            title={!voiceBlob ? 'Audio recording required to post' : 'Publish to Music Community'}
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="music-spin" size={16} /> Publishing...
              </>
            ) : (
              <>
                <Send size={16} /> Post
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
