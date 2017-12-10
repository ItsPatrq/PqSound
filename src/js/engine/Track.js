import Store from '../stroe';
import { isNullOrUndefined } from 'engine/Utils';
class Track {
  constructor(newVolume, newPan) {
    newVolume = newVolume || 1.0;
    newPan = newPan || 0.0;
    if (!isNullOrUndefined(Store)) {
      this.context = Store.getState().webAudio.context;
      this.gainNode = this.context.createGain();
      this.panNode = this.context.createStereoPanner();

      this.gainNode.connect(this.panNode);
      this.input = this.gainNode;
      this.output = this.panNode;

      this.gainNode.gain.setValueAtTime(newVolume, this.context.currentTime);
      this.panNode.pan.setValueAtTime(newPan, this.context.currentTime);
    }
  }

  changeVolume(newVolume, changeTime) {
    changeTime = changeTime || this.context.currentTime;
    this.gainNode.gain.exponentialRampToValueAtTime(newVolume, changeTime);
  }

  changePan(newPan, changeTime) {
    changeTime = changeTime || this.context.currentTime;
    this.panNode.pan.exponentialRampToValueAtTime(newPan, changeTime);
  }

  getTrackNode() {
    return { input: this.input, output: this.output }
  }

  addAsLastToChain(node){
    node.connect(this.input);
    return this.output;
  }

  /**
  * due to initializing web audio api at start of application and sampler is the default instrument
  */
  initContext() {
    if(isNullOrUndefined(this.context)){
      this.context = Store.getState().webAudio.context;
      this.constructor();
    }
  }
}

export default Track;