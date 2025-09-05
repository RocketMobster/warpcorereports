import React, { useEffect, useState } from 'react';
import { setSoundEnabled, setVolume, soundSettings } from '../utils/sounds';

interface SoundControlsProps {
  className?: string;
}

export default function SoundControls({ className = '' }: SoundControlsProps) {
  const [enabled, setEnabled] = useState(soundSettings.enabled);
  const [volume, setVolumeState] = useState(soundSettings.volume);

  // Initialize sound settings from localStorage
  useEffect(() => {
    // Update component state when soundSettings changes
    setEnabled(soundSettings.enabled);
    setVolumeState(soundSettings.volume);
  }, []);

  // Handle toggle sound
  const handleToggleSound = () => {
    const newState = !enabled;
    setEnabled(newState);
    setSoundEnabled(newState);
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolumeState(newVolume);
    setVolume(newVolume);
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        onClick={handleToggleSound}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm ${
          enabled 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        } transition-colors`}
        title={enabled ? 'Disable LCARS sounds' : 'Enable LCARS sounds'}
      >
        {enabled ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/>
              <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z"/>
              <path d="M8.707 11.182A4.486 4.486 0 0 0 10.025 8a4.486 4.486 0 0 0-1.318-3.182L8 5.525A3.489 3.489 0 0 1 9.025 8 3.49 3.49 0 0 1 8 10.475l.707.707zM6.717 3.55A.5.5 0 0 1 7.2 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.562-1.9a.5.5 0 0 1 .33-.05z"/>
            </svg>
            <span>Sounds On</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M6.717 3.55A.5.5 0 0 1 7.2 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.562-1.9a.5.5 0 0 1 .33-.05zm7.854.606a.5.5 0 0 1 0 .708L12.207 8l2.364 2.364a.5.5 0 0 1-.708.708L11.5 8.707l-2.364 2.364a.5.5 0 0 1-.708-.708L10.793 8 8.43 5.636a.5.5 0 0 1 .708-.708L11.5 7.293l2.364-2.364a.5.5 0 0 1 .708 0z"/>
            </svg>
            <span>Sounds Off</span>
          </>
        )}
      </button>
      
      {enabled && (
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="text-slate-400" viewBox="0 0 16 16">
            <path d="M8 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm0 1a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>
            <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/>
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      )}
    </div>
  );
}
