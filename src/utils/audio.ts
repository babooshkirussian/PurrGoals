/**
 * Audio synthesis & sound effects for PurrGoals.
 * Includes user-provided cat audio assets and retro 8-bit Web Audio synthesizers.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// User-provided cat audio files
const PURR_AUDIO_PATH = '/assets/aistudio/Cat_Purr_13ffb684.m4a';
const MEOW_AUDIO_PATH = '/assets/aistudio/Cat_Meow_9b4892e2.m4a';

let purrAudio: HTMLAudioElement | null = null;
let meowAudio: HTMLAudioElement | null = null;

export function playCatPurr(soundEnabled = true) {
  if (!soundEnabled) return;
  try {
    if (!purrAudio) {
      purrAudio = new Audio(PURR_AUDIO_PATH);
    }
    purrAudio.currentTime = 0;
    purrAudio.volume = 0.85;
    purrAudio.play().catch(() => {
      // Fallback synthesizer if autoplay blocked
      playChiptunePurr();
    });
  } catch {
    playChiptunePurr();
  }
}

export function playCatMeow(soundEnabled = true) {
  if (!soundEnabled) return;
  try {
    if (!meowAudio) {
      meowAudio = new Audio(MEOW_AUDIO_PATH);
    }
    meowAudio.currentTime = 0;
    meowAudio.volume = 0.9;
    meowAudio.play().catch(() => {
      // Fallback synthesizer
      playChiptuneMeow();
    });
  } catch {
    playChiptuneMeow();
  }
}

/**
 * 8-Bit Retro Coin Sound (B5 to E6 chime)
 */
export function playCoinSound(soundEnabled = true) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(987.77, now); // B5
  osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.35);
}

/**
 * 8-Bit Munch / Eating Sound
 */
export function playMunchSound(soundEnabled = true) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  [0, 0.12, 0.24].forEach((delay, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const startFreq = idx % 2 === 0 ? 320 : 220;
    osc.frequency.setValueAtTime(startFreq, now + delay);
    osc.frequency.exponentialRampToValueAtTime(80, now + delay + 0.09);

    gain.gain.setValueAtTime(0.25, now + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + delay);
    osc.stop(now + delay + 0.1);
  });
}

/**
 * 8-Bit Celebration Fanfare
 */
export function playFanfareSound(soundEnabled = true) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [
    { freq: 523.25, dur: 0.1 }, // C5
    { freq: 659.25, dur: 0.1 }, // E5
    { freq: 783.99, dur: 0.1 }, // G5
    { freq: 1046.5, dur: 0.4 }, // C6
  ];

  let current = now;
  notes.forEach((note) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(note.freq, current);

    gain.gain.setValueAtTime(0.22, current);
    gain.gain.exponentialRampToValueAtTime(0.001, current + note.dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(current);
    osc.stop(current + note.dur);
    current += note.dur * 0.9;
  });
}

/**
 * 8-Bit Button Click
 */
export function playClickSound(soundEnabled = true) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(440, now);
  osc.frequency.exponentialRampToValueAtTime(220, now + 0.04);

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.04);
}

/**
 * 8-Bit Timer Ding
 */
export function playTimerDing(soundEnabled = true) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  [1046.5, 1318.51, 1567.98].forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const noteTime = now + idx * 0.12;
    osc.frequency.setValueAtTime(freq, noteTime);

    gain.gain.setValueAtTime(0.25, noteTime);
    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + 0.5);
  });
}

function playChiptuneMeow() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(500, now);
  osc.frequency.linearRampToValueAtTime(750, now + 0.15);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.4);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.4);
}

function playChiptunePurr() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(80, now);

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.6);
}
