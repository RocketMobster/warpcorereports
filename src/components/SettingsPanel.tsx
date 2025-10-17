import React from 'react';
import SoundControls from './SoundControls';

interface SettingsPanelProps {
  densityCompact: boolean;
  setDensityCompact: (value: boolean) => void;
  persistZoom: boolean;
  setPersistZoom: (value: boolean) => void;
  highContrastMode: boolean;
  setHighContrastMode: (value: boolean) => void;
  verboseAnnouncements: boolean;
  setVerboseAnnouncements: (value: boolean) => void;
}

export default function SettingsPanel({
  densityCompact,
  setDensityCompact,
  persistZoom,
  setPersistZoom,
  highContrastMode,
  setHighContrastMode,
  verboseAnnouncements,
  setVerboseAnnouncements
}: SettingsPanelProps) {
  return (
    <div className="space-y-4 text-sm">
      <div className="border-b border-slate-700 pb-4">
        <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-3">Display Settings</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input 
              id="highContrastMode" 
              type="checkbox" 
              checked={highContrastMode} 
              onChange={e => {
                const v = e.target.checked;
                try {
                  localStorage.setItem('wcr_high_contrast_enabled', v ? '1' : '0');
                } catch {}
                setHighContrastMode(v);
              }} 
            />
            <label htmlFor="highContrastMode" className="text-xs uppercase tracking-wider">High Contrast Mode</label>
          </div>
          <div className="flex items-center gap-2">
            <input 
              id="densityCompact" 
              type="checkbox" 
              checked={densityCompact} 
              onChange={e => setDensityCompact(e.target.checked)} 
            />
            <label htmlFor="densityCompact" className="text-xs uppercase tracking-wider">Compact Density</label>
          </div>
          <div className="flex items-center gap-2">
            <input 
              id="persistZoom" 
              type="checkbox" 
              checked={persistZoom} 
              onChange={e => { 
                const v = e.target.checked; 
                try { 
                  localStorage.setItem('wcr_zoom_persist_enabled', v ? '1' : '0'); 
                  if (!v) localStorage.removeItem('previewZoom'); 
                } catch {};
                setPersistZoom(v);
                window.dispatchEvent(new Event('wcr-zoom-persist-changed')); 
              }} 
            />
            <label htmlFor="persistZoom" className="text-xs uppercase tracking-wider">Remember Zoom Level</label>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-700 pb-4">
        <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-3">Sound Settings</h3>
        <SoundControls />
      </div>

      <div className="pb-4">
        <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-3">Accessibility</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input 
              id="verboseAnnouncements" 
              type="checkbox" 
              checked={verboseAnnouncements} 
              onChange={e => {
                const v = e.target.checked;
                try {
                  localStorage.setItem('wcr_verbose_announcements', v ? '1' : '0');
                } catch {}
                setVerboseAnnouncements(v);
              }}
            />
            <label htmlFor="verboseAnnouncements" className="text-xs uppercase tracking-wider">Verbose Announcements</label>
          </div>
          <p className="text-xs text-slate-400 ml-6">
            Controls the verbosity of screen reader announcements for rank adjustments and other automated changes
          </p>
        </div>
      </div>
    </div>
  );
}