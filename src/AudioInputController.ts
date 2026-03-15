export class AudioInputController {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private isInitialized = false;
  
  // Calibration settings (persistent in memory, could be saved to localStorage)
  private walkThreshold = 0.03;
  private jumpThreshold = 0.12;

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 512; // Increased for better resolution
      this.analyser.smoothingTimeConstant = 0.2; // Fast response for peaks

      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.microphone.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      
      // Load saved thresholds if any
      const savedWalk = localStorage.getItem('frog_walk_threshold');
      const savedJump = localStorage.getItem('frog_jump_threshold');
      if (savedWalk) this.walkThreshold = parseFloat(savedWalk);
      if (savedJump) this.jumpThreshold = parseFloat(savedJump);
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  public getVolume(): number {
    if (!this.analyser || !this.dataArray) return 0;

    this.analyser.getByteTimeDomainData(this.dataArray as any);

    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      const v = (this.dataArray[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / this.dataArray.length);
    return rms;
  }

  public setThresholds(walk: number, jump: number): void {
    this.walkThreshold = walk;
    this.jumpThreshold = jump;
    localStorage.setItem('frog_walk_threshold', walk.toString());
    localStorage.setItem('frog_jump_threshold', jump.toString());
  }

  public getThresholds() {
    return { walk: this.walkThreshold, jump: this.jumpThreshold };
  }

  public resume(): void {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

export const audioController = new AudioInputController();
