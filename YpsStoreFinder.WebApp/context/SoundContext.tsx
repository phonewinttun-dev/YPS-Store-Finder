'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';

interface SoundContextValue {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  playComplete: () => void;
  setProcessing: (active: boolean) => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);
const SOUND_STORAGE_KEY = 'yps_sound_enabled';
const SOUND_CHANGE_EVENT = 'yps-sound-change';

function getSoundSnapshot() {
  try {
    return window.localStorage.getItem(SOUND_STORAGE_KEY) !== 'false';
  } catch {
    return true;
  }
}

function getSoundServerSnapshot() {
  return true;
}

function subscribeSound(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === SOUND_STORAGE_KEY || event.key === null) onStoreChange();
  };
  window.addEventListener('storage', handleStorage);
  window.addEventListener(SOUND_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(SOUND_CHANGE_EVENT, onStoreChange);
  };
}

function playTone(frequencies: number[], duration: number) {
  const AudioContextClass = window.AudioContext;
  if (!AudioContextClass) return;

  const audioContext = new AudioContextClass();
  const now = audioContext.currentTime;
  frequencies.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const start = now + index * 0.055;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.025, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.01);
  });

  window.setTimeout(() => void audioContext.close(), Math.ceil((duration + frequencies.length * 0.055 + 0.05) * 1000));
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const enabled = useSyncExternalStore(subscribeSound, getSoundSnapshot, getSoundServerSnapshot);
  const canPlayRef = useRef(false);
  const processingRef = useRef(false);
  const humRef = useRef<{ context: AudioContext; oscillator: OscillatorNode; gain: GainNode } | null>(null);

  const stopHum = useCallback(() => {
    const hum = humRef.current;
    if (!hum) return;
    hum.gain.gain.cancelScheduledValues(hum.context.currentTime);
    hum.gain.gain.setTargetAtTime(0.0001, hum.context.currentTime, 0.035);
    window.setTimeout(() => {
      try {
        hum.oscillator.stop();
      } catch {
        // The oscillator may already have stopped during fast route changes.
      }
      void hum.context.close();
    }, 160);
    humRef.current = null;
  }, []);

  const startHum = useCallback(() => {
    if (!canPlayRef.current || humRef.current || document.hidden) return;
    const AudioContextClass = window.AudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(72, context.currentTime);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.007, context.currentTime + 0.18);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    humRef.current = { context, oscillator, gain };
  }, []);

  const setEnabled = useCallback((nextEnabled: boolean) => {
    try {
      window.localStorage.setItem(SOUND_STORAGE_KEY, String(nextEnabled));
    } catch {
      return;
    }
    window.dispatchEvent(new Event(SOUND_CHANGE_EVENT));
    if (nextEnabled && canPlayRef.current) {
      playTone([440, 660], 0.08);
      if (processingRef.current) startHum();
    } else if (!nextEnabled) {
      stopHum();
    }
  }, [startHum, stopHum]);

  const playComplete = useCallback(() => {
    if (enabled && canPlayRef.current) playTone([523.25, 659.25, 783.99], 0.11);
  }, [enabled]);

  const setProcessing = useCallback((active: boolean) => {
    processingRef.current = active;
    if (active && enabled && canPlayRef.current) startHum();
    else stopHum();
  }, [enabled, startHum, stopHum]);

  useEffect(() => {
    const handlePointerUp = (event: PointerEvent) => {
      canPlayRef.current = true;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (enabled && target.closest('button, a, select, [role="button"]')) playTone([360], 0.045);
      if (enabled && processingRef.current) startHum();
    };
    document.addEventListener('pointerup', handlePointerUp);
    return () => document.removeEventListener('pointerup', handlePointerUp);
  }, [enabled, startHum]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) stopHum();
      else if (enabled && processingRef.current && canPlayRef.current) startHum();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, startHum, stopHum]);

  useEffect(() => () => stopHum(), [stopHum]);

  const value = useMemo(
    () => ({ enabled, setEnabled, playComplete, setProcessing }),
    [enabled, playComplete, setEnabled, setProcessing]
  );
  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) throw new Error('useSound must be used within SoundProvider');
  return context;
}
