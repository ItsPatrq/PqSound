import Store from '../stroe';
import * as Utils from 'engine/Utils';
import { TrackTypes } from 'constants/Constants';
export default class Sound {
  constructor(newContext) {
    this.context = newContext;
    this.playingSounds = [[], [], []]; // trackindex, note, origin, nodes, endindex
  }

  scheduleStop(sixteenthPlaying, contextPlayTime, origin) {
    for (let i = this.playingSounds[origin].length - 1; i >= 0; i--) {
      let currNote = this.playingSounds[origin][i];
      if (currNote.endIndex === sixteenthPlaying) {
        this.stop(currNote.nodes.source, contextPlayTime);
        this.playingSounds[origin].splice(i, 1)
      }
    }
  }

  stopAll(origin) {
    for (let i = this.playingSounds[origin].length - 1; i >= 0; i--) {
      this.stop(this.playingSounds[origin][i].nodes.source);
    }
    this.playingSounds[origin].length = 0;
  }

  play(trackIndex, contextPlayTime, note, origin, endIndex) {
    if (Utils.isNullOrUndefined(contextPlayTime)) {
      contextPlayTime = this.context.currentTime + 0.01;
    }

    let nodes = {};

    let currTrack = Utils.getTrackByIndex(Store.getState().tracks.trackList, trackIndex);
    let source = currTrack.instrument.getInstrumentSoundNode(note);
    nodes.source = source;
    nodes.aux = new Array;
    
    let lastChainedNode = this.getAuxChainNode(source, trackIndex, nodes);

    lastChainedNode.connect(this.context.destination);
    
    source.start(contextPlayTime);
    this.playingSounds[origin].push( { trackIndex: trackIndex, note: note, origin: origin, nodes: {...nodes}, endIndex: endIndex });
  }

  stop(sourceNode, contextStopTime) {
    if (Utils.isNullOrUndefined(contextStopTime)) {
      contextStopTime = this.context.currentTime + 0.01;
    }
    //sourceNode.gain.exponentialRampToValueAtTime(0.001, contextStopTime);
    sourceNode.stop(contextStopTime);
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

  getCurrTrackPresetNode(currTrack, currentNodes) {
    let gainNode = this.context.createGain();
    let panNode = this.context.createStereoPanner();
    gainNode.gain.setValueAtTime(currTrack.volume, this.context.currentTime);
    panNode.pan.setValueAtTime(currTrack.pan, this.context.currentTime);
    gainNode.connect(panNode);
    currentNodes.gainNode = gainNode;
    currentNodes.panNode = panNode;
    return { input: gainNode, output: panNode };
  }

  getAuxChainNode(lastChainedNode, trackIndex, currrNodes) {
    let currTrack = Utils.getTrackByIndex(Store.getState().tracks.trackList, trackIndex);
    currrNodes.aux[currrNodes.aux.length] = {};
    let currentNodes = currrNodes.aux[currrNodes.aux.length - 1];
    currentNodes.trackIndex = trackIndex;
    if (!Utils.isNullUndefinedOrEmpty(currTrack.pluginList)) {
      let pluginsNode = this.getPluginsChainNode(currTrack.pluginList);
      lastChainedNode.connect(pluginsNode.input);
      lastChainedNode = pluginsNode.output;
    }
    let currTrackPresetNode = this.getCurrTrackPresetNode(currTrack, currentNodes);
    lastChainedNode.connect(currTrackPresetNode.input);
    lastChainedNode = currTrackPresetNode.output;

    if (trackIndex !== 0) {
      return this.getAuxChainNode(lastChainedNode, currTrack.output, currrNodes);
    }
    else {
      return lastChainedNode;
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