import Store from '../stroe';
import * as Utils from 'engine/Utils';

export default class Sound {
  constructor(newContext) {
    this.context = newContext;
  }

  play(trackIndex, contextPlayTime, note) {
    if (Utils.isNullOrUndefined(contextPlayTime)) {
      contextPlayTime = this.context.currentTime + 0.01;
    }
    let currTrack = Utils.getTrackByIndex(Store.getState().tracks.trackList, trackIndex);
    let source = currTrack.instrument.getInstrumentSoundNode(note);
    /*let lastChainedNode = */
    this.getAuxChainNode(source, trackIndex);

    source.start(contextPlayTime);
  }

  stop() {
    var ct = this.context.currentTime + 0.5;

    this.gainNode.gain.exponentialRampToValueAtTime(0.001, ct);
    this.source.stop(ct);
  }

  getPluginsChainNode(pluginList) {
    let firstPluginInChain = pluginList[0].getPluginNode();
    let lastPluginInChain = firstPluginInChain;
    for (let i = 1; i < pluginList.length; i++) {
      let curPluginNode = pluginList[i].getPluginNode();
      lastPluginInChain.output.connect(curPluginNode.input);
      lastPluginInChain = curPluginNode;
    }
    return {input: firstPluginInChain.input, output: lastPluginInChain.output};
  }

  getCurrTrackPresetNode(currTrack){
    let gainNode = this.context.createGain();
    let panNode = this.context.createStereoPanner();
    gainNode.gain.value = currTrack.volume;
    panNode.panvalue = currTrack.pan;
    gainNode.connect(panNode);
    return {input: gainNode, output: panNode};
  }

  getAuxChainNode(lastChainedNode, trackIndex){
    let currTrack = Utils.getTrackByIndex(Store.getState().tracks.trackList, trackIndex);
    if (!Utils.isNullUndefinedOrEmpty(currTrack.pluginList)) {
      let pluginsNode = this.getPluginsChainNode(currTrack.pluginList);
      lastChainedNode.connect(pluginsNode.input);
      lastChainedNode = pluginsNode.output;
    }
    let currTrackPresetNode = this.getCurrTrackPresetNode(currTrack);
    lastChainedNode.connect(currTrackPresetNode.input);
    lastChainedNode = currTrackPresetNode.output;

    if(trackIndex !== 0){
      return this.getAuxChainNode(lastChainedNode, currTrack.output);
    }
    else {
      lastChainedNode.connect(this.context.destination);
      return lastChainedNode;
    }
  }
}