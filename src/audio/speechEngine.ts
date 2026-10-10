/**
 * Browser SpeechSynthesis Voice Engine
 * Handles voice loading, intelligent adult male English selection,
 * speech queue control, anti-stacking, and visualizer state updates.
 */

export interface VoiceOption {
  voice: SpeechSynthesisVoice;
  name: string;
  lang: string;
  isEnglish: boolean;
  isLikelyMale: boolean;
  score: number;
}

export type SpeechStateCallback = (speaking: boolean, currentText: string) => void;

class SpeechEngine {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private isMuted: boolean = false;
  private isSpeaking: boolean = false;
  private currentUtteranceText: string = '';
  private stateListeners: Set<SpeechStateCallback> = new Set();
  private isUserGestureRequired: boolean = false;
  private lastSpeechEndTime: number = 0;

  // Male name heuristics for synthesis detection
  private readonly maleNames = [
    'david', 'mark', 'daniel', 'george', 'guy', 'alex', 'fred', 'oliver',
    'james', 'tom', 'arthur', 'ryan', 'brian', 'andrew', 'richard', 'charles',
    'matthew', 'male', 'man', 'boy', 'guy'
  ];

  private readonly femaleNames = [
    'zira', 'samantha', 'victoria', 'karen', 'hazel', 'susan', 'catherine',
    'fiona', 'tessa', 'female', 'woman', 'girl', 'helena', 'moira', 'serena'
  ];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  public subscribe(cb: SpeechStateCallback): () => void {
    this.stateListeners.add(cb);
    cb(this.isSpeaking, this.currentUtteranceText);
    return () => this.stateListeners.delete(cb);
  }

  private notify() {
    this.stateListeners.forEach((cb) => cb(this.isSpeaking, this.currentUtteranceText));
  }

  public loadVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    this.voices = this.synth.getVoices();
    if (this.voices.length > 0 && !this.selectedVoice) {
      this.selectedVoice = this.getBestMaleEnglishVoice();
    }
    return this.voices;
  }

  public getAvailableVoices(): VoiceOption[] {
    const list = this.voices.length > 0 ? this.voices : (this.synth?.getVoices() || []);
    return list.map((v) => {
      const lowerName = v.name.toLowerCase();
      const isEnglish = v.lang.startsWith('en');
      const hasMaleName = this.maleNames.some((m) => lowerName.includes(m));
      const hasFemaleName = this.femaleNames.some((f) => lowerName.includes(f));
      const isLikelyMale = hasMaleName && !hasFemaleName;

      let score = 0;
      if (isEnglish) score += 50;
      if (v.lang === 'en-US') score += 20;
      if (v.lang === 'en-GB') score += 15;
      if (isLikelyMale) score += 30;
      if (lowerName.includes('natural') || lowerName.includes('neural') || lowerName.includes('online')) score += 10;
      if (hasFemaleName) score -= 30;

      return {
        voice: v,
        name: v.name,
        lang: v.lang,
        isEnglish,
        isLikelyMale,
        score,
      };
    }).sort((a, b) => b.score - a.score);
  }

  public getBestMaleEnglishVoice(): SpeechSynthesisVoice | null {
    const options = this.getAvailableVoices();
    if (options.length === 0) return null;

    // First try: English + Likely Male
    const maleEn = options.find((o) => o.isEnglish && o.isLikelyMale);
    if (maleEn) return maleEn.voice;

    // Second try: Any English voice that is not explicitly female
    const neutralEn = options.find((o) => o.isEnglish && !this.femaleNames.some((f) => o.name.toLowerCase().includes(f)));
    if (neutralEn) return neutralEn.voice;

    // Third try: Any English voice
    const anyEn = options.find((o) => o.isEnglish);
    if (anyEn) return anyEn.voice;

    return options[0]?.voice || null;
  }

  public setVoiceByURI(uri: string) {
    const found = this.voices.find((v) => v.voiceURI === uri);
    if (found) {
      this.selectedVoice = found;
    }
  }

  public getSelectedVoice(): SpeechSynthesisVoice | null {
    if (!this.selectedVoice) {
      this.selectedVoice = this.getBestMaleEnglishVoice();
    }
    return this.selectedVoice;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.cancel();
    }
  }

  public cancel() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // Safe catch
      }
    }
    this.isSpeaking = false;
    this.currentUtteranceText = '';
    this.notify();
  }

  public isBusy(): boolean {
    return this.isSpeaking || (this.synth ? this.synth.speaking || this.synth.pending : false);
  }

  public timeSinceLastSpeech(): number {
    return Date.now() - this.lastSpeechEndTime;
  }

  /**
   * Speak a phrase with settings and priority options
   */
  public speak(
    text: string,
    options?: {
      rate?: number;
      pitch?: number;
      volume?: number;
      force?: boolean; // Cancel previous and speak immediately
      priority?: 'HIGH' | 'NORMAL' | 'LOW';
    }
  ): Promise<boolean> {
    if (!this.synth || this.isMuted || !text.trim()) {
      return Promise.resolve(false);
    }

    const {
      rate = 1.08,
      pitch = 1.0,
      volume = 1.0,
      force = false,
      priority = 'NORMAL',
    } = options || {};

    // Don't overwhelm if already speaking and not forced
    if (this.isBusy() && !force && priority !== 'HIGH') {
      return Promise.resolve(false);
    }

    if (force || priority === 'HIGH') {
      this.cancel();
    }

    return new Promise((resolve) => {
      try {
        // In case Chrome paused synthesis bug
        if (this.synth!.paused) {
          this.synth!.resume();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        const voice = this.getSelectedVoice();
        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang || 'en-US';
        } else {
          utterance.lang = 'en-US';
        }

        utterance.rate = Math.max(0.7, Math.min(1.8, rate));
        utterance.pitch = Math.max(0.6, Math.min(1.6, pitch));
        utterance.volume = Math.max(0, Math.min(1, volume));

        utterance.onstart = () => {
          this.isSpeaking = true;
          this.currentUtteranceText = text;
          this.isUserGestureRequired = false;
          this.notify();
        };

        utterance.onend = () => {
          this.isSpeaking = false;
          this.currentUtteranceText = '';
          this.lastSpeechEndTime = Date.now();
          this.notify();
          resolve(true);
        };

        utterance.onerror = (e) => {
          this.isSpeaking = false;
          this.currentUtteranceText = '';
          this.lastSpeechEndTime = Date.now();
          this.notify();
          if (e.error === 'not-allowed') {
            this.isUserGestureRequired = true;
          }
          resolve(false);
        };

        this.synth!.speak(utterance);
      } catch {
        this.isSpeaking = false;
        this.currentUtteranceText = '';
        this.notify();
        resolve(false);
      }
    });
  }

  public testVoice(sampleText = "Hey everyone! It's your host here, and our snake is locked and loaded!"): Promise<boolean> {
    return this.speak(sampleText, { force: true, priority: 'HIGH' });
  }

  public getGestureRequired(): boolean {
    return this.isUserGestureRequired;
  }

  public clearGestureRequired() {
    this.isUserGestureRequired = false;
  }
}

export const speechEngine = new SpeechEngine();
