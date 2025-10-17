// LCARS Sound Effect Utility
// Manages loading and playing LCARS UI sound effects

// Resolve asset base to work in both dev ('/') and GitHub Pages ('/warpcorereports/')
// Vite injects import.meta.env.BASE_URL at build time.
const BASE = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.BASE_URL) ? (import.meta as any).env.BASE_URL : '/';

// Helper to prefix paths with the correct base; avoid double slashes
const withBase = (p: string) => `${BASE}${p.replace(/^\//, '')}`;

// Sound effect URLs (served from public/sounds)
const soundFiles = {
  buttonClick: withBase('sounds/lcars_beep1.mp3'),
  buttonHover: withBase('sounds/lcars_hover.mp3'),
  alert: withBase('sounds/lcars_alert.mp3'),
  success: withBase('sounds/lcars_success.mp3'),
  negative: withBase('sounds/lcars_negative.mp3'),
  processing: withBase('sounds/lcars_processing.mp3'),
  chartEdit: withBase('sounds/lcars_edit.mp3'),
  notification: withBase('sounds/lcars_notification.mp3'),
  shareReport: withBase('sounds/lcars_share.mp3'),
  toggleOn: withBase('sounds/lcars_toggle_on.mp3'),
  toggleOff: withBase('sounds/lcars_toggle_off.mp3'),
};

// Global settings
let soundEnabled = true;
let volume = 0.5; // 0.0 to 1.0

// AudioContext for synthesizing sounds when files are not available
let audioContext: AudioContext | null = null;
let gainNode: GainNode | null = null;

// Initialize AudioContext
const initAudioContext = () => {
  if (typeof window === 'undefined' || !window.AudioContext) return;
  try {
    audioContext = new AudioContext();
    gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(audioContext.destination);
  } catch (error) {
    console.error('Failed to initialize AudioContext:', error);
  }
};

// Generate a synthetic beep sound
const generateBeep = (freq: number, duration: number, type: OscillatorType = 'sine') => {
  if (!audioContext || !gainNode) return;
  
  try {
    const oscillator = audioContext.createOscillator();
    oscillator.type = type;
    oscillator.frequency.value = freq;
    oscillator.connect(gainNode);
    oscillator.start();
    setTimeout(() => oscillator.stop(), duration);
  } catch (error) {
    console.error('Failed to generate beep:', error);
  }
};

// LCARS button click sound
const syntheticButtonClick = () => {
  if (!audioContext) initAudioContext();
  if (!gainNode) return;
  
  gainNode.gain.value = volume * 0.1;
  generateBeep(1800, 20);
  setTimeout(() => generateBeep(2400, 20), 30);
};

// LCARS alert sound
const syntheticAlert = () => {
  if (!audioContext) initAudioContext();
  if (!gainNode) return;
  
  gainNode.gain.value = volume * 0.1;
  generateBeep(1600, 100, 'square');
  setTimeout(() => generateBeep(1200, 100, 'square'), 150);
  setTimeout(() => generateBeep(1600, 100, 'square'), 300);
};

// LCARS success sound
const syntheticSuccess = () => {
  if (!audioContext) initAudioContext();
  if (!gainNode) return;
  
  gainNode.gain.value = volume * 0.1;
  generateBeep(1300, 40);
  setTimeout(() => generateBeep(1800, 40), 50);
  setTimeout(() => generateBeep(2300, 40), 100);
};

// LCARS notification sound
const syntheticNotification = () => {
  if (!audioContext) initAudioContext();
  if (!gainNode) return;
  
  gainNode.gain.value = volume * 0.1;
  generateBeep(2200, 30);
  setTimeout(() => generateBeep(1800, 30), 40);
  setTimeout(() => generateBeep(2200, 30), 80);
};

// LCARS toggle on sound
const syntheticToggleOn = () => {
  if (!audioContext) initAudioContext();
  if (!gainNode) return;
  
  gainNode.gain.value = volume * 0.1;
  generateBeep(1400, 30);
  setTimeout(() => generateBeep(1800, 30), 40);
};

// LCARS toggle off sound
const syntheticToggleOff = () => {
  if (!audioContext) initAudioContext();
  if (!gainNode) return;
  
  gainNode.gain.value = volume * 0.1;
  generateBeep(1800, 30);
  setTimeout(() => generateBeep(1400, 30), 40);
};

// LCARS processing sound
const syntheticProcessing = () => {
  if (!audioContext) initAudioContext();
  if (!gainNode) return;
  
  gainNode.gain.value = volume * 0.1;
  for (let i = 0; i < 3; i++) {
    setTimeout(() => generateBeep(1400 + i * 200, 40), i * 80);
  }
};

// LCARS chart edit sound
const syntheticChartEdit = () => {
  if (!audioContext) initAudioContext();
  if (!gainNode) return;
  
  gainNode.gain.value = volume * 0.1;
  generateBeep(1600, 20, 'triangle');
  setTimeout(() => generateBeep(1900, 20, 'triangle'), 30);
  setTimeout(() => generateBeep(2200, 20, 'triangle'), 60);
};

// Map of synthetic sound generators
const syntheticSounds: Record<keyof typeof soundFiles, () => void> = {
  buttonClick: syntheticButtonClick,
  buttonHover: () => generateBeep(1600, 10),
  alert: syntheticAlert,
  success: syntheticSuccess,
  negative: () => {
    generateBeep(800, 100, 'sawtooth');
    setTimeout(() => generateBeep(600, 100, 'sawtooth'), 120);
  },
  processing: syntheticProcessing,
  chartEdit: syntheticChartEdit,
  notification: syntheticNotification,
  shareReport: () => {
    generateBeep(1200, 40);
    setTimeout(() => generateBeep(1600, 40), 50);
  },
  toggleOn: syntheticToggleOn,
  toggleOff: syntheticToggleOff,
};

// Audio objects cache to prevent repeated loading
const audioCache: Record<string, HTMLAudioElement> = {};

/**
 * Preload all sound effects for immediate playback
 */
export const preloadSounds = () => {
  if (typeof window === 'undefined') return; // Skip during SSR
  
  Object.entries(soundFiles).forEach(([key, url]) => {
    try {
      const audio = new Audio(url);
      audio.volume = volume;
      audio.load();
      audioCache[key] = audio;
    } catch (error) {
      console.log(`Using synthetic sounds for: ${key}`);
    }
  });
  
  // Initialize AudioContext for synthetic sounds
  initAudioContext();
};

/**
 * Play a specific sound effect
 * @param sound The sound effect key to play
 */
export const playSound = (sound: keyof typeof soundFiles) => {
  if (!soundEnabled || typeof window === 'undefined') return;
  
  try {
    // Use cached audio if available, otherwise create new audio object
    let audio = audioCache[sound];
    
    if (!audio) {
      audio = new Audio(soundFiles[sound]);
      audio.volume = volume;
      audioCache[sound] = audio;
    }
    
    // Try to play the audio file
    audio.currentTime = 0;
    audio.play().catch(error => {
      console.log(`Using synthetic sound for: ${sound}`);
      // If file playback fails, use synthetic sound
      const syntheticSound = syntheticSounds[sound];
      if (syntheticSound) syntheticSound();
    });
  } catch (error) {
    // Fallback to synthetic sound
    const syntheticSound = syntheticSounds[sound];
    if (syntheticSound) syntheticSound();
  }
};

/**
 * Enable or disable all sounds
 * @param enabled Whether sounds should be enabled
 */
export const setSoundEnabled = (enabled: boolean) => {
  soundEnabled = enabled;
  
  // Store the preference in localStorage for persistence
  if (typeof window !== 'undefined') {
    localStorage.setItem('lcars_sound_enabled', enabled ? 'true' : 'false');
  }
};

/**
 * Set the volume for all sounds
 * @param level Volume level from 0.0 to 1.0
 */
export const setVolume = (level: number) => {
  // Clamp volume between 0 and 1
  volume = Math.max(0, Math.min(1, level));
  
  // Update volume on all cached audio elements
  Object.values(audioCache).forEach(audio => {
    audio.volume = volume;
  });
  
  // Update volume for synthetic sounds
  if (gainNode) {
    gainNode.gain.value = volume;
  }
  
  // Store the preference in localStorage for persistence
  if (typeof window !== 'undefined') {
    localStorage.setItem('lcars_sound_volume', volume.toString());
  }
};

/**
 * Initialize sound settings from localStorage (if available)
 */
export const initSoundSettings = () => {
  if (typeof window === 'undefined') return;
  
  // Load sound enabled preference
  const storedSoundEnabled = localStorage.getItem('lcars_sound_enabled');
  if (storedSoundEnabled !== null) {
    soundEnabled = storedSoundEnabled === 'true';
  }
  
  // Load volume preference
  const storedVolume = localStorage.getItem('lcars_sound_volume');
  if (storedVolume !== null) {
    volume = parseFloat(storedVolume);
  }
  
  // Preload sounds for immediate playback
  preloadSounds();
};

// Utility function to handle button click sound
export const buttonClickSound = () => playSound('buttonClick');

// Utility function to handle alert sound
export const alertSound = () => playSound('alert');

// Utility function to handle success sound
export const successSound = () => playSound('success');

// Utility function to handle notification sound
export const notificationSound = () => playSound('notification');

// Export the sound files and settings object
export const soundSettings = {
  files: soundFiles,
  enabled: soundEnabled,
  volume: volume,
};
