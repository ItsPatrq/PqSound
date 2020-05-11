import Store from '../stroe';
import * as Utils from './Utils';
import { SoundOrigin } from '../constants/Constants';

export default class Sound {
  context: AudioContext;
  playingSounds: any[][];
  constructor(newContext: AudioContext) {
    if(newContext.state !== "running") {
      newContext.resume();
    }
    this.context = newContext;
    this.playingSounds = [[], [], []]; // trackindex, note, origin, endindex
  }

  scheduleStop(sixteenthPlaying: number, contextPlayTime: number, origin: number) {
    for (let i = this.playingSounds[origin].length - 1; i >= 0; i--) {
      const currNote = this.playingSounds[origin][i];
      if (currNote.endIndex === sixteenthPlaying) {
        this.stop(currNote.trackIndex, currNote.note, contextPlayTime);
        this.playingSounds[origin].splice(i, 1)
      }
    }
  }

  stopAll(origin: number) {
    for (let i = 0; i < this.playingSounds[origin].length; i++) {
      this.stop(this.playingSounds[origin][i].trackIndex, this.playingSounds[origin][i].note);
    }
    this.playingSounds[origin].length = 0;
  }

  play(trackIndex, contextPlayTime, note, origin, endIndex) {
    if (Utils.isNullOrUndefined(contextPlayTime)) {
      contextPlayTime = this.context.currentTime + 0.001;
    }
    if(origin === SoundOrigin.composition){
      this.playingSounds[origin].push({ trackIndex: trackIndex, note: note, origin: origin, endIndex: endIndex });
    }

    const currTrack = Utils.getTrackByIndex(Store.getState().tracks.trackList, trackIndex);
    currTrack.instrument.noteOn(note, contextPlayTime);
  }

  stop(trackIndex: number, note: number, contextStopTime?: number) {
    if (Utils.isNullOrUndefined(contextStopTime)) {
      contextStopTime = this.context.currentTime + 0.001;
    }
    const currTrack = Utils.getTrackByIndex(Store.getState().tracks.trackList, trackIndex);
    currTrack.instrument.noteOff(note, contextStopTime);
  }
}