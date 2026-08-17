/**
 * Plays a clean, crisp 2-tone notification chime ("Yahoo" style tone) using Web Audio API.
 * Respects user's notification sound settings from localStorage.
 */
export function playNotificationSound() {
  try {
    // Check if user disabled sound alerts in Notification Settings
    const currentUserRaw = localStorage.getItem('user');
    let userId = 'guest';
    if (currentUserRaw) {
      try {
        const parsed = JSON.parse(currentUserRaw);
        userId = parsed.id || parsed.username || 'guest';
      } catch (e) {}
    }

    const savedPrefsRaw = localStorage.getItem(`user_notif_prefs_${userId}`);
    if (savedPrefsRaw) {
      try {
        const prefs = JSON.parse(savedPrefsRaw);
        if (prefs.soundAlerts === false) {
          return; // User turned off sound alerts
        }
      } catch (e) {}
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Tone 1: High crisp intro (587.33 Hz - D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.15);

    // Tone 2: Vibrant chime (880.00 Hz - A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.1);
    gain2.gain.setValueAtTime(0.22, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.45);
  } catch (e) {
    console.warn('[Sound Playback Error]:', e);
  }
}
