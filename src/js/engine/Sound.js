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
    for (let i = this.playingSounds[origin].length - 1; i >= 0; i--) {
      this.stop(this.playingSounds[origin][i].trackIndex);
    }
    this.playingSounds[origin].length = 0;
  }

  play(trackIndex, contextPlayTime, note, origin, endIndex) {
    if (Utils.isNullOrUndefined(contextPlayTime)) {
      contextPlayTime = this.context.currentTime + 0.01;
    }
    this.playingSounds[origin].push( { trackIndex: trackIndex, note: note, origin: origin, endIndex: endIndex });

    let currTrack = Utils.getTrackByIndex(Store.getState().tracks.trackList, trackIndex);
    
    let auxChain = this.getAuxChainNode(trackIndex);

    auxChain.output.connect(this.context.destination);
    
    currTrack.instrument.connect(auxChain.input);
    currTrack.instrument.noteOn(note, contextPlayTime);
  }

  stop(trackIndex, note, contextStopTime) {
    if (Utils.isNullOrUndefined(contextStopTime)) {
      contextStopTime = this.context.currentTime + 0.01;
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

  getCurrTrackPresetNode(currTrack) {
    let gainNode = this.context.createGain();
    let panNode = this.context.createStereoPanner();
    gainNode.gain.setValueAtTime(currTrack.volume, this.context.currentTime);
    panNode.pan.setValueAtTime(currTrack.pan, this.context.currentTime);
    gainNode.connect(panNode);
    return { input: gainNode, output: panNode };
  }

  getAuxChainNode(trackIndex, currrNodes, prevChain) {
    let currTrack = Utils.getTrackByIndex(Store.getState().tracks.trackList, trackIndex);
    let currInput, currOutput;
    if(!Utils.isNullUndefinedOrEmpty(prevChain)){
      currInput = prevChain.input;
      currOutput = prevChain.output;
    }

    if (!Utils.isNullUndefinedOrEmpty(currTrack.pluginList)) {
      let pluginsNode = this.getPluginsChainNode(currTrack.pluginList);
      if(Utils.isNullUndefinedOrEmpty(prevChain)){
        currInput = pluginsNode.input;
        currOutput = pluginsNode.output;
      } else {
        currOutput.connect(pluginsNode.input);
        currOutput = pluginsNode.output;
      }
    }

    let currTrackPresetNode = this.getCurrTrackPresetNode(currTrack);
    if(Utils.isNullUndefinedOrEmpty(currInput)){
      currInput = currTrackPresetNode.input;
      currOutput = currTrackPresetNode.output;
    } else {
      currOutput.connect(currTrackPresetNode.input);
      currOutput = currTrackPresetNode.output;
    }

    let currChain = {input: currInput, output: currOutput};

    if (trackIndex !== 0) {
      return this.getAuxChainNode(currTrack.output, currrNodes, currChain);
    }
    else {
      return currChain;
    }
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
      for(let i = 0; i < playingTrackSound.length; i++){
        switch(changeSource){
          case ChangeSourceEnum.trackParams: {
            switch(changeIndex){
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