const MUTE_STORAGE_KEY = 'payday-kingdom-sound-muted';
const MASTER_VOLUME = 0.4;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function readMutedFromStorage() {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return window.localStorage.getItem(MUTE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeMutedToStorage(muted) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(MUTE_STORAGE_KEY, muted ? 'true' : 'false');
  } catch {
    // Ignore storage write failures.
  }
}

function createImpulseBuffer(context, duration = 0.22, decay = 2.5) {
  const length = Math.max(1, Math.floor(context.sampleRate * duration));
  const buffer = context.createBuffer(2, length, context.sampleRate);

  for (let channel = 0; channel < 2; channel += 1) {
    const data = buffer.getChannelData(channel);

    for (let i = 0; i < length; i += 1) {
      const t = i / length;
      data[i] = (Math.random() * 2 - 1) * ((1 - t) ** decay);
    }
  }

  return buffer;
}

function createNoiseBuffer(context, color = 'white', duration = 1) {
  const length = Math.max(1, Math.floor(context.sampleRate * duration));
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);

  if (color === 'pink') {
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let b3 = 0;
    let b4 = 0;
    let b5 = 0;
    let b6 = 0;

    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      data[i] = clamp((b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11, -1, 1);
      b6 = white * 0.115926;
    }

    return buffer;
  }

  for (let i = 0; i < length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }

  return buffer;
}

class SoundManager {
  constructor() {
    this.muted = readMutedFromStorage();
    this.listeners = new Set();
    this.userInteracted = false;

    this.context = null;
    this.masterGain = null;
    this.reverbNode = null;
    this.pinkNoiseBuffer = null;
    this.whiteNoiseBuffer = null;

    this.unlockHandler = this.unlockFromGesture.bind(this);
    this.registerUnlockListeners();
  }

  registerUnlockListeners() {
    if (typeof window === 'undefined') {
      return;
    }

    const options = { passive: true, capture: true };
    window.addEventListener('pointerdown', this.unlockHandler, options);
    window.addEventListener('keydown', this.unlockHandler, options);
    window.addEventListener('touchstart', this.unlockHandler, options);
  }

  unregisterUnlockListeners() {
    if (typeof window === 'undefined') {
      return;
    }

    window.removeEventListener('pointerdown', this.unlockHandler, true);
    window.removeEventListener('keydown', this.unlockHandler, true);
    window.removeEventListener('touchstart', this.unlockHandler, true);
  }

  notify() {
    this.listeners.forEach((listener) => listener());
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  isMuted() {
    return this.muted;
  }

  setMuted(nextMuted) {
    this.muted = Boolean(nextMuted);
    writeMutedToStorage(this.muted);
    this.notify();
  }

  toggleMuted() {
    this.setMuted(!this.muted);
  }

  ensureContext() {
    if (typeof window === 'undefined') {
      return false;
    }

    if (this.context) {
      return true;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return false;
    }

    this.context = new AudioContextClass();
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = MASTER_VOLUME;
    this.masterGain.connect(this.context.destination);

    this.reverbNode = this.context.createConvolver();
    this.reverbNode.buffer = createImpulseBuffer(this.context);

    const wetGain = this.context.createGain();
    wetGain.gain.value = 0.15;
    this.reverbNode.connect(wetGain);
    wetGain.connect(this.masterGain);

    this.whiteNoiseBuffer = createNoiseBuffer(this.context, 'white', 1.2);
    this.pinkNoiseBuffer = createNoiseBuffer(this.context, 'pink', 1.2);

    return true;
  }

  async unlockFromGesture() {
    this.userInteracted = true;

    if (!this.ensureContext() || !this.context) {
      return;
    }

    if (this.context.state !== 'running') {
      try {
        await this.context.resume();
      } catch {
        return;
      }
    }

    this.unregisterUnlockListeners();
  }

  canPlay() {
    if (this.muted || !this.userInteracted) {
      return false;
    }

    if (!this.ensureContext() || !this.context || !this.masterGain) {
      return false;
    }

    if (this.context.state !== 'running') {
      return false;
    }

    return true;
  }

  currentTime(offset = 0.01) {
    return this.context.currentTime + offset;
  }

  applyEnvelope(gainNode, startTime, peakGain, duration, attack = 0.005, release = 0.06) {
    const attackTime = Math.max(0.001, attack);
    const releaseTime = Math.max(0.001, release);
    const sustainUntil = startTime + Math.max(0.001, duration - releaseTime);

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.linearRampToValueAtTime(peakGain, startTime + attackTime);
    gainNode.gain.setValueAtTime(peakGain, sustainUntil);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  }

  playOscSweep({
    fromHz,
    toHz,
    duration,
    type = 'sine',
    volume = 0.12,
    startOffset = 0,
    attack = 0.005,
    release = 0.06,
    destination = null
  }) {
    if (!this.canPlay() || !this.context || !this.masterGain) {
      return;
    }

    const startTime = this.currentTime(startOffset);
    const endTime = startTime + duration;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(10, fromHz), startTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(10, toHz), endTime);

    this.applyEnvelope(gain, startTime, volume, duration, attack, release);

    osc.connect(gain);
    gain.connect(destination ?? this.masterGain);
    osc.start(startTime);
    osc.stop(endTime + 0.02);
  }

  playNoiseSweep({
    fromHz,
    toHz,
    duration,
    volume = 0.12,
    color = 'white',
    startOffset = 0,
    q = 5,
    filterType = 'bandpass'
  }) {
    if (!this.canPlay() || !this.context || !this.masterGain) {
      return;
    }

    const startTime = this.currentTime(startOffset);
    const endTime = startTime + duration;

    const source = this.context.createBufferSource();
    source.buffer = color === 'pink' ? this.pinkNoiseBuffer : this.whiteNoiseBuffer;

    const filter = this.context.createBiquadFilter();
    filter.type = filterType;
    filter.Q.value = q;
    filter.frequency.setValueAtTime(Math.max(40, fromHz), startTime);
    filter.frequency.exponentialRampToValueAtTime(Math.max(40, toHz), endTime);

    const gain = this.context.createGain();
    this.applyEnvelope(gain, startTime, volume, duration, 0.006, 0.09);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start(startTime);
    source.stop(endTime + 0.02);
  }

  playNoteSequence({ notesHz, noteDuration, type = 'sine', volume = 0.12, gap = 0, withReverb = false, withTremolo = false }) {
    if (!this.canPlay() || !this.context || !this.masterGain) {
      return;
    }

    notesHz.forEach((frequency, index) => {
      const startOffset = index * (noteDuration + gap);

      if (!withTremolo) {
        this.playOscSweep({
          fromHz: frequency,
          toHz: frequency,
          duration: noteDuration,
          type,
          volume,
          startOffset,
          attack: 0.01,
          release: 0.08,
          destination: withReverb && this.reverbNode ? this.reverbNode : this.masterGain
        });
        return;
      }

      const startTime = this.currentTime(startOffset);
      const endTime = startTime + noteDuration;

      const osc = this.context.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, startTime);

      const gain = this.context.createGain();
      this.applyEnvelope(gain, startTime, volume, noteDuration, 0.02, 0.12);

      const tremoloLFO = this.context.createOscillator();
      tremoloLFO.type = 'sine';
      tremoloLFO.frequency.setValueAtTime(7.5, startTime);
      const tremoloDepth = this.context.createGain();
      tremoloDepth.gain.setValueAtTime(volume * 0.35, startTime);

      tremoloLFO.connect(tremoloDepth);
      tremoloDepth.connect(gain.gain);

      osc.connect(gain);
      gain.connect(this.masterGain);
      if (withReverb && this.reverbNode) {
        gain.connect(this.reverbNode);
      }

      tremoloLFO.start(startTime);
      tremoloLFO.stop(endTime + 0.03);
      osc.start(startTime);
      osc.stop(endTime + 0.03);
    });
  }

  playBillAdd() {
    this.playOscSweep({
      fromHz: 100,
      toHz: 400,
      duration: 0.1,
      type: 'sine',
      volume: 0.11,
      attack: 0.02,
      release: 0.05
    });
  }

  playBillRemove() {
    this.playOscSweep({
      fromHz: 400,
      toHz: 100,
      duration: 0.1,
      type: 'sine',
      volume: 0.11,
      attack: 0.01,
      release: 0.05
    });
  }

  playPaydayStart() {
    this.playNoteSequence({
      notesHz: [440, 554.37, 659.25],
      noteDuration: 0.2,
      type: 'square',
      volume: 0.1,
      gap: 0.02,
      withReverb: true
    });
  }

  playHeroSpawn() {
    this.playOscSweep({
      fromHz: 80,
      toHz: 70,
      duration: 0.3,
      type: 'square',
      volume: 0.14,
      attack: 0.005,
      release: 0.12
    });

    this.playOscSweep({
      fromHz: 800,
      toHz: 1200,
      duration: 0.2,
      type: 'triangle',
      volume: 0.08,
      startOffset: 0.03,
      attack: 0.01,
      release: 0.08
    });
  }

  playMonsterSlay() {
    this.playNoiseSweep({
      fromHz: 2000,
      toHz: 500,
      duration: 0.15,
      volume: 0.09,
      color: 'white',
      q: 6.5,
      filterType: 'bandpass'
    });

    this.playOscSweep({
      fromHz: 60,
      toHz: 50,
      duration: 0.1,
      type: 'triangle',
      volume: 0.1,
      startOffset: 0.04,
      attack: 0.004,
      release: 0.08
    });
  }

  playXPTick() {
    [0, 0.1, 0.2].forEach((offset) => {
      this.playOscSweep({
        fromHz: 600,
        toHz: 600,
        duration: 0.05,
        type: 'sine',
        volume: 0.085,
        startOffset: offset,
        attack: 0.006,
        release: 0.04
      });
    });
  }

  playLevelUp() {
    this.playNoteSequence({
      notesHz: [523.25, 659.25, 783.99, 1046.5],
      noteDuration: 0.15,
      type: 'sine',
      volume: 0.1,
      gap: 0.02,
      withReverb: true
    });
  }

  playVictory() {
    this.playNoteSequence({
      notesHz: [659.25, 783.99, 987.77, 1318.51],
      noteDuration: 0.3,
      type: 'sine',
      volume: 0.1,
      gap: 0.03,
      withReverb: true,
      withTremolo: true
    });
  }

  playIslandGrow() {
    this.playNoiseSweep({
      fromHz: 200,
      toHz: 800,
      duration: 0.4,
      volume: 0.08,
      color: 'pink',
      q: 2.4,
      filterType: 'bandpass'
    });
  }
}

export const soundManager = new SoundManager();

export { MUTE_STORAGE_KEY };
