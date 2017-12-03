import Store from '../stroe';
import { getTrackByIndex } from 'engine/Utils';
import { isNullOrUndefined } from './Utils';

class Sound {
  constructor(trackIndex) {
    this.trackIndex = trackIndex;
    this.context = Store.getState().webAudio.context;
  }

  getBuffers(note){
    let currentTrack = getTrackByIndex(Store.getState().tracks.trackList, this.trackIndex);
    if (currentTrack.instrument.name === 'Sampler') {
      let currentPreset = currentTrack.instrument.preset;
      for (let i = 0; i < Store.getState().webAudio.samplerInstrumentsSounds.length; i++) {
        if (Store.getState().webAudio.samplerInstrumentsSounds[i].name === currentPreset) {
          return Store.getState().webAudio.samplerInstrumentsSounds[i].buffer[note];
        }
      }
    }
  }

  getVolume(){
    for(let i = 0; i < Store.getState().tracks.trackList.length; i++){
      if(Store.getState().tracks.trackList[i].index === this.trackIndex){
        return 1000;
      }
    }
  }

  setup(note) {
    this.gainNode = this.context.createGain();
    this.source = this.context.createBufferSource();
    this.source.buffer = this.getBuffers(note);
    this.source.connect(this.gainNode);
    this.gainNode.connect(this.context.destination);
    this.gainNode.gain.setValueAtTime(this.getVolume(), this.context.currentTime);
  }

  play(contextPlayTime, note) {
    if (!isNullOrUndefined(contextPlayTime)) {
      contextPlayTime = this.context.currentTime + 0.01;
    }
    if (!isNullOrUndefined(this.getBuffers(note))) {
      this.setup(note);
      this.source.start(contextPlayTime);
    }
  }

  stop() {
    var ct = this.context.currentTime + 0.5;

    this.gainNode.gain.exponentialRampToValueAtTime(0.001, ct);
    this.source.stop(ct);
  }

}

module.exports = Sound;