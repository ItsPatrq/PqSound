import Store from '../stroe';
import * as Utils from 'engine/Utils';

export default class Sound {
  constructor(newContext) {
    this.context = newContext;
    this.playingSounds = [[], [], []]; // trackindex, note, origin, source, endindex
  }

  scheduleStop(sixteenthPlaying, contextPlayTime, origin) {
    for (let i = this.playingSounds[origin].length - 1; i >= 0; i--) {
      let currNote = this.playingSounds[origin][i];
      if (currNote.endIndex === sixteenthPlaying) {
        console.log(currNote);
        this.stop(currNote.source, contextPlayTime);
        this.playingSounds[origin].splice(i, 1)
      }
    }
  }

  stopAll(origin) {
    for (let i = this.playingSounds[origin].length - 1; i >= 0; i--) {
      this.stop(this.playingSounds[origin][i].source);
    }
    this.playingSounds[origin].length = 0;
  }

  play(trackIndex, contextPlayTime, note, origin, endIndex) {
    if (Utils.isNullOrUndefined(contextPlayTime)) {
      contextPlayTime = this.context.currentTime + 0.01;
    }
    let currTrack = Utils.getTrackByIndex(Store.getState().tracks.trackList, trackIndex);
    let source = currTrack.instrument.getInstrumentSoundNode(note);
    /*let lastChainedNode = */
    this.getAuxChainNode(source, trackIndex);

    source.start(contextPlayTime);
    console.log(endIndex);
    this.playingSounds[origin].push({ trackIndex: trackIndex, note: note, origin: origin, source: source, endIndex: endIndex });
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

  getCurrTrackPresetNode(currTrack) {
    let gainNode = this.context.createGain();
    let panNode = this.context.createStereoPanner();
    gainNode.gain.setValueAtTime(currTrack.volume, this.context.currentTime);
    panNode.pan.setValueAtTime(currTrack.pan, this.context.currentTime);
    gainNode.connect(panNode);
    return { input: gainNode, output: panNode };
  }

  getAuxChainNode(lastChainedNode, trackIndex) {
    let currTrack = Utils.getTrackByIndex(Store.getState().tracks.trackList, trackIndex);
    if (!Utils.isNullUndefinedOrEmpty(currTrack.pluginList)) {
      let pluginsNode = this.getPluginsChainNode(currTrack.pluginList);
      lastChainedNode.connect(pluginsNode.input);
      lastChainedNode = pluginsNode.output;
    }
    let currTrackPresetNode = this.getCurrTrackPresetNode(currTrack);
    lastChainedNode.connect(currTrackPresetNode.input);
    lastChainedNode = currTrackPresetNode.output;

    if (trackIndex !== 0) {
      return this.getAuxChainNode(lastChainedNode, currTrack.output);
    }
    else {
      lastChainedNode.connect(this.context.destination);
      return lastChainedNode;
    }
  }
}