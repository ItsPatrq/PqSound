import Store from '../stroe';
import * as Utils from 'engine/Utils';
import { TrackTypes } from 'constants/Constants';
export default class Sound {
  constructor(newContext) {
    this.context = newContext;
    this.playingSounds = [[], [], []]; // trackindex, note, origin, endindex
  }

  scheduleStop(sixteenthPlaying, contextPlayTime, origin) {
    for (let i = this.playingSounds[origin].length - 1; i >= 0; i--) {
      let currNote = this.playingSounds[origin][i];
      if (currNote.endIndex === sixteenthPlaying) {
        this.stop(currNote.trackIndex, currNote.note, contextPlayTime);
        this.playingSounds[origin].splice(i, 1)
      }
    }
  }

  stopAll(origin) {
    for (let i = 0; i < this.playingSounds[origin].length; i++) {
      this.stop(this.playingSounds[origin][i].trackIndex, this.playingSounds[origin][i].note);
    }
    this.playingSounds[origin].length = 0;
  }

  play(trackIndex, contextPlayTime, note, origin, endIndex) {
    if (Utils.isNullOrUndefined(contextPlayTime)) {
      contextPlayTime = this.context.currentTime + 0.01;
    }
    this.playingSounds[origin].push({ trackIndex: trackIndex, note: note, origin: origin, endIndex: endIndex });

    let currTrack = Utils.getTrackByIndex(Store.getState().tracks.trackList, trackIndex);

    let auxChain = this.getAuxChainNode(trackIndex);

    auxChain.output.connect(this.context.destination);

    currTrack.instrument.connect(auxChain.input);
    currTrack.instrument.noteOn(note, contextPlayTime);
  }

  stop(trackIndex, note, contextStopTime) {
    if (Utils.isNullOrUndefined(contextStopTime)) {
      contextStopTime = this.context.currentTime + 0.001;
    }
    let currTrack = Utils.getTrackByIndex(Store.getState().tracks.trackList, trackIndex);
    currTrack.instrument.noteOff(note, contextStopTime);
  }

  getPluginsChainNode(pluginList) {
    let firstPluginInChain = pluginList[0].getPluginNode();
    let lastPluginInChain = firstPluginInChain;
    for (let i = 1; i < pluginList.length; i++) {
      let curPluginNode = pluginList[i].getPluginNode();
      lastPluginInChain.output.connect(curPluginNode.input);
      lastPluginInChain = curPluginNode;
    }
    return { input: firstPluginInChain.input, output: lastPluginInChain.output };
  }

  getAuxChainNode(trackIndex) {
    let chainInput, chainOutput;
    while (!Utils.isNullUndefinedOrEmpty(trackIndex)){
      
      let currTrack = Utils.getTrackByIndex(Store.getState().tracks.trackList, trackIndex);
      let currInput, currOutput;

      if (!Utils.isNullUndefinedOrEmpty(currTrack.pluginList)) {
        let pluginsNode = this.getPluginsChainNode(currTrack.pluginList);
        currInput = pluginsNode.input;
        currOutput = pluginsNode.output;
        currOutput = currTrack.addAsLastToChain(currOutput);
      } else {
        currInput = currTrack.trackNode.getTrackNode().input;
        currOutput = currTrack.trackNode.getTrackNode().output;
      }
      if(Utils.isNullUndefinedOrEmpty(chainInput) && Utils.isNullUndefinedOrEmpty(chainOutput)){
        chainInput = currInput;
        chainOutput = currOutput;
      } else {
        chainOutput.connect(currInput);
        chainOutput = currOutput;
      }
      trackIndex = currTrack.output;
    }
    return { input: chainInput, output: chainOutput };
  }

  onParamChange(trackIndex, trackType, changeSource, changeIndex, changeId, newValue) {
    let playingTrackSound = new Array;
    if (trackType === TrackTypes.virtualInstrument) {
      for (let i = 0; i < this.playingSounds.length; i++) {
        for (let j = 0; j < this.playingSounds[i].length; j++) {
          if (this.playingSounds[i][j].trackIndex === trackIndex) {
            playingTrackSound.push(this.playingSounds[i][j]);
          }
        }
      }
      for (let i = 0; i < playingTrackSound.length; i++) {
        switch (changeSource) {
          case ChangeSourceEnum.trackParams: {
            switch (changeIndex) {
              case TrackParams.volume: {
                playingTrackSound[i].nodes.aux[0].gainNode.gain.setValueAtTime(newValue, this.context.currentTime);
                break;
              }
              case TrackParams.pan: {
                playingTrackSound[i].nodes.aux[0].panNode.pan.setValueAtTime(newValue, this.context.currentTime);
                break;
              }
            }
            break;
          }
        }
      }
    }

  }
}

const ChangeSourceEnum = {
  trackParams: 0
}

const TrackParams = {
  volume: 0,
  pan: 1
}