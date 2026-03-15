export class AudioInputController {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private isInitialized = false;
  
  // Calibration settings
  private noiseFloor = 0.01;
  private walkThreshold = 0.05;
  private jumpThreshold = 0.15;

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.1; // Lower for even faster peak detection

      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.microphone.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      
      this.loadSavedThresholds();
      this.isInitialized = true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  private loadSavedThresholds() {
    const savedWalk = localStorage.getItem('frog_walk_threshold');
    const savedJump = localStorage.getItem('frog_jump_threshold');
    const savedNoise = localStorage.getItem('frog_noise_floor');
    
    if (savedWalk) this.walkThreshold = parseFloat(savedWalk);
    if (savedJump) this.jumpThreshold = parseFloat(savedJump);
    if (savedNoise) this.noiseFloor = parseFloat(savedNoise);
  }

  public getVolume(): number {
    if (!this.analyser || !this.dataArray) return 0;
    this.analyser.getByteTimeDomainData(this.dataArray as any);
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      const v = (this.dataArray[i] - 128) / 128;
      sum += v * v;
    }
    return Math.sqrt(sum / this.dataArray.length);
  }

  public setThresholds(walk: number, jump: number, noise: number): void {
    this.walkThreshold = walk;
    this.jumpThreshold = jump;
    this.noiseFloor = noise;
    localStorage.setItem('frog_walk_threshold', walk.toString());
    localStorage.setItem('frog_jump_threshold', jump.toString());
    localStorage.setItem('frog_noise_floor', noise.toString());
  }

  public getThresholds() {
    return { 
      walk: this.walkThreshold, 
      jump: this.jumpThreshold, 
      noise: this.noiseFloor 
    };
  }

  public resume(): void {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

export const audioController = new AudioInputController();
