let reduce = false;
try {
  reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
} catch {}

function canVibrate(): boolean {
  try {
    return !reduce && typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
  } catch {
    return false;
  }
}

export function haptic(pattern: number | number[]) {
  if (!canVibrate()) return;
  try { navigator.vibrate(pattern); } catch {}
}

export function hapticLight() { haptic(12); }
export function hapticMedium() { haptic(28); }
export function hapticHeavy() { haptic(48); }
export function hapticSuccess() { haptic([12, 20, 12]); }
export function hapticError() { haptic([20, 30, 20, 30]); }
