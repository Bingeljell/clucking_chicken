export class AudioInputController {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private isInitialized = false;

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;

      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.microphone.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      this.isInitialized = true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  public getVolume(): number {
    if (!this.analyser || !this.dataArray) return 0;

    // Use type assertion to avoid TS2345: Uint8Array<ArrayBufferLike> vs Uint8Array<ArrayBuffer>
    this.analyser.getByteTimeDomainData(this.dataArray as any);

    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      const v = (this.dataArray[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / this.dataArray.length);
    return rms; // Normalized volume value (0.0 to 1.0ish)
  }

  public resume(): void {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

// Singleton instance
export const audioController = new AudioInputController();
