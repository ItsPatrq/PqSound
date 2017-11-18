class Sound {
  constructor(context, buffer, volume) {
    this.context = context;
    this.buffer = buffer;
    this.volume = volume;
  }

  setup() {
    this.gainNode = this.context.createGain();
    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.connect(this.gainNode);
    this.gainNode.connect(this.context.destination);
    this.gainNode.gain.setValueAtTime(this.volume, this.context.currentTime);
  }

  play() {
    this.setup();
    this.source.start(this.context.currentTime);
  }

  stop() {
    var ct = this.context.currentTime + 0.5;
    
    this.gainNode.gain.exponentialRampToValueAtTime(0.001, ct);
    this.source.stop(ct);
  }

}

module.exports = Sound;