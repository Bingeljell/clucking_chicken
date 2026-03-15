export class AudioInputController {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private dataArray: Uint8Array | null = null;
  private isInitialized = false;
  
  // Calibration settings (Normalized 0.0 to 1.0)
  public noiseFloor = 0.02;
  public walkThreshold = 0.08;
  public jumpThreshold = 0.25;
  public inputGain = 1.0; // Multiplier for quiet mics

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.gainNode = this.audioContext.createGain();
      this.analyser = this.audioContext.createAnalyser();
      
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.05; // Extremely fast for peaks

      this.microphone.connect(this.gainNode);
      this.gainNode.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      
      this.loadSavedSettings();
      this.isInitialized = true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  private loadSavedSettings() {
    const savedWalk = localStorage.getItem('frog_walk_threshold');
    const savedJump = localStorage.getItem('frog_jump_threshold');
    const savedNoise = localStorage.getItem('frog_noise_floor');
    const savedGain = localStorage.getItem('frog_input_gain');
    
    if (savedWalk) this.walkThreshold = parseFloat(savedWalk);
    if (savedJump) this.jumpThreshold = parseFloat(savedJump);
    if (savedNoise) this.noiseFloor = parseFloat(savedNoise);
    if (savedGain) this.inputGain = parseFloat(savedGain);
    
    if (this.gainNode) this.gainNode.gain.value = this.inputGain;
  }

  public getVolume(): number {
    if (!this.analyser || !this.dataArray) return 0;
    this.analyser.getByteTimeDomainData(this.dataArray as any);
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      const v = (this.dataArray[i] - 128) / 128;
      sum += v * v;
    }
    const vol = Math.sqrt(sum / this.dataArray.length);
    return Math.min(vol, 1.0); // Cap at 1.0
  }

  public saveSettings(walk: number, jump: number, noise: number, gain: number): void {
    this.walkThreshold = walk;
    this.jumpThreshold = jump;
    this.noiseFloor = noise;
    this.inputGain = gain;
    
    if (this.gainNode) this.gainNode.gain.value = gain;

    localStorage.setItem('frog_walk_threshold', walk.toString());
    localStorage.setItem('frog_jump_threshold', jump.toString());
    localStorage.setItem('frog_noise_floor', noise.toString());
    localStorage.setItem('frog_input_gain', gain.toString());
  }

  public getThresholds() {
    return {
      walk: this.walkThreshold,
      jump: this.jumpThreshold,
      noise: this.noiseFloor,
      gain: this.inputGain
    };
  }

  public resume(): void {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

export const audioController = new AudioInputController();
