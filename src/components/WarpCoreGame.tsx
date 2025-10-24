import React, { useState, useEffect, useRef } from 'react';
import { playSound } from '../utils/sounds';

interface WarpCoreGameProps {
  onComplete: (score: number, perfect: boolean) => void;
  onCancel: () => void;
}

interface SystemState {
  name: string;
  value: number;
  drift: number;
  color: string;
}

export default function WarpCoreGame({ onComplete, onCancel }: WarpCoreGameProps) {
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [systems, setSystems] = useState<SystemState[]>([
    { name: 'EPS Flow', value: 50, drift: 0, color: 'amber' },
    { name: 'Plasma Temp', value: 50, drift: 0, color: 'purple' },
    { name: 'Matter/Antimatter', value: 50, drift: 0, color: 'cyan' },
    { name: 'Dilithium Matrix', value: 50, drift: 0, color: 'rose' },
  ]);

  const gameLoopRef = useRef<number>();
  const driftTimerRef = useRef<number>();

  // Optimal range: 40-60
  const MIN_OPTIMAL = 40;
  const MAX_OPTIMAL = 60;
  const MIN_VALUE = 0;
  const MAX_VALUE = 100;

  // Start game
  const startGame = () => {
    setIsRunning(true);
    setTimeRemaining(30);
    setScore(0);
    setSystems(prev => prev.map(s => ({ ...s, value: 50, drift: 0 })));
    try { playSound('buttonClick'); } catch {}
  };

  // Adjust system value
  const adjustSystem = (index: number, delta: number) => {
    if (!isRunning) return;
    setSystems(prev => {
      const newSystems = [...prev];
      newSystems[index].value = Math.max(MIN_VALUE, Math.min(MAX_VALUE, newSystems[index].value + delta));
      return newSystems;
    });
    try { playSound('toggleOn'); } catch {}
  };

  // Game loop: update drift and score
  useEffect(() => {
    if (!isRunning) return;

    // Main game loop (10 FPS - much more manageable)
    gameLoopRef.current = window.setInterval(() => {
      // Apply drift to systems
      setSystems(prev => prev.map(s => ({
        ...s,
        value: Math.max(MIN_VALUE, Math.min(MAX_VALUE, s.value + s.drift))
      })));

      // Calculate score increment
      setSystems(prev => {
        const inOptimalRange = prev.filter(s => s.value >= MIN_OPTIMAL && s.value <= MAX_OPTIMAL).length;
        setScore(prevScore => prevScore + inOptimalRange);
        return prev;
      });
    }, 100); // 10 FPS instead of 60 FPS

    // Drift change timer (every 2-4 seconds, change drift on random systems)
    const scheduleDriftChange = () => {
      driftTimerRef.current = window.setTimeout(() => {
        setSystems(prev => prev.map(s => ({
          ...s,
          drift: (Math.random() - 0.5) * 0.4 // Random drift between -0.2 and +0.2 per frame (much slower)
        })));
        scheduleDriftChange();
      }, 2000 + Math.random() * 2000); // Every 2-4 seconds instead of 1-2
    };
    scheduleDriftChange();

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (driftTimerRef.current) clearTimeout(driftTimerRef.current);
    };
  }, [isRunning]);

  // Timer countdown - using interval for more reliable timing
  useEffect(() => {
    if (!isRunning) return;
    
    const timerInterval = setInterval(() => {
      setTimeRemaining(t => {
        if (t <= 1) {
          setIsRunning(false);
          const maxScore = 30 * 10 * 4; // 30 seconds * 10 FPS * 4 systems = 1200
          const perfect = score >= maxScore * 0.95;
          try { playSound(perfect ? 'success' : 'negative'); } catch {}
          // Give user 5 seconds to read results before generating report
          setTimeout(() => onComplete(score, perfect), 5000);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [isRunning, score, onComplete]);

  // System color based on value
  const getSystemColor = (value: number): string => {
    if (value >= MIN_OPTIMAL && value <= MAX_OPTIMAL) return 'bg-green-500';
    if (value >= MIN_OPTIMAL - 10 && value <= MAX_OPTIMAL + 10) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSystemBorderColor = (color: string): string => {
    const colors: Record<string, string> = {
      amber: 'border-amber-400',
      purple: 'border-purple-400',
      cyan: 'border-cyan-400',
      rose: 'border-rose-400',
    };
    return colors[color] || 'border-slate-400';
  };

  const maxScore = 30 * 60 * 4;
  const scorePercentage = Math.round((score / maxScore) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-slate-900 border-2 border-amber-500 rounded-lg p-6 max-w-2xl w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-amber-300 uppercase tracking-wider">Warp Core Stabilization</h2>
            <p className="text-xs text-slate-400 mt-1">Keep all systems in optimal range (40-60)</p>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-amber-300 text-2xl leading-none transition-colors"
            title="Close game"
            aria-label="Close game"
          >
            ×
          </button>
        </div>

        {/* Game status */}
        {!isRunning && timeRemaining === 30 && (
          <div className="text-center py-8">
            <p className="text-lg text-slate-300 mb-4">
              Adjust system levels using the ▲ and ▼ controls.<br />
              Keep all four systems in the green zone as long as possible.
            </p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg uppercase tracking-wider transition-colors"
            >
              Begin Diagnostic
            </button>
          </div>
        )}

        {/* Game complete */}
        {!isRunning && timeRemaining === 0 && (
          <div className="text-center py-8">
            <p className="text-2xl font-bold text-amber-300 mb-2">
              Diagnostic Complete
            </p>
            <p className="text-lg text-slate-300 mb-2">
              Performance: {scorePercentage}%
            </p>
            <p className="text-sm text-slate-400">
              {scorePercentage >= 95 ? '🏆 Perfect stabilization! Commendation recommended.' :
               scorePercentage >= 80 ? '✅ Excellent work. Systems nominal.' :
               scorePercentage >= 60 ? '⚠️ Adequate performance. Minor issues noted.' :
               '❌ Critical failures detected. Incident report required.'}
            </p>
          </div>
        )}

        {/* Active game */}
        {isRunning && (
          <>
            {/* Timer and score */}
            <div className="flex items-center justify-between mb-4 p-3 bg-slate-800 rounded-lg border border-slate-700">
              <div className="text-center flex-1">
                <div className="text-xs text-slate-400 uppercase tracking-wider">Time Remaining</div>
                <div className="text-3xl font-bold text-amber-300 tabular-nums">{timeRemaining}s</div>
              </div>
              <div className="text-center flex-1">
                <div className="text-xs text-slate-400 uppercase tracking-wider">Performance</div>
                <div className="text-3xl font-bold text-cyan-300 tabular-nums">{scorePercentage}%</div>
              </div>
            </div>

            {/* Systems */}
            <div className="space-y-4">
              {systems.map((system, index) => (
                <div key={system.name} className={`p-4 bg-slate-800 rounded-lg border-2 ${getSystemBorderColor(system.color)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-200 uppercase tracking-wide">{system.name}</span>
                    <span className="text-xs text-slate-400 tabular-nums">{Math.round(system.value)}%</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="relative h-8 bg-slate-950 rounded overflow-hidden mb-2">
                    <div 
                      className={`absolute left-0 top-0 bottom-0 transition-all ${getSystemColor(system.value)}`}
                      style={{ width: `${system.value}%` }}
                    />
                    {/* Optimal range markers */}
                    <div className="absolute top-0 bottom-0 border-l-2 border-dashed border-green-300/30" style={{ left: '40%' }} />
                    <div className="absolute top-0 bottom-0 border-l-2 border-dashed border-green-300/30" style={{ left: '60%' }} />
                  </div>

                  {/* Controls */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => adjustSystem(index, -5)}
                      className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded transition-colors"
                      aria-label={`Decrease ${system.name}`}
                    >
                      ▼ Decrease
                    </button>
                    <button
                      onClick={() => adjustSystem(index, 5)}
                      className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded transition-colors"
                      aria-label={`Increase ${system.name}`}
                    >
                      ▲ Increase
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
