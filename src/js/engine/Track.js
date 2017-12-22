import Store from '../stroe';
import { isNullOrUndefined, getTrackByIndex } from 'engine/Utils';
class Track {
  constructor(newPluginList, newInstrument, newOutputTrackIndex, newVolume, newPan) {
    this.pluginNodeList = newPluginList;
    this.outputTrackIndex = newOutputTrackIndex;
    this.instrument = newInstrument;
    newVolume = newVolume || 1.0;
    newPan = newPan || 0.0;
    this.solo = false;
    this.mute = false;
    this.anySolo = false;
    if (!isNullOrUndefined(Store)) {
      this.context = Store.getState().webAudio.context;
      this.gainNode = this.context.createGain();
      this.muteNode = this.context.createGain();
      this.panNode = this.context.createStereoPanner();

      this.gainNode.connect(this.panNode);
      this.input = this.gainNode;
      this.output = this.panNode;

      this.gainNode.gain.setValueAtTime(newVolume, this.context.currentTime);
      this.muteNode.gain.setValueAtTime(0.000001, this.context.currentTime);
      this.panNode.pan.setValueAtTime(newPan, this.context.currentTime);
      if (isNullOrUndefined(this.outputTrackIndex)) {
        this.panNode.connect(this.context.destination);
      } else {
        this.panNode.connect(getTrackByIndex(Store.getState().tracks.trackList, this.outputTrackIndex).trackNode.input);
      }
      if (!isNullOrUndefined(newInstrument)) {
        newInstrument.connect(this.input);
      }
    }
  }

  getPluginChainNode() {
    let firstPluginInChain = this.pluginNodeList[0].getPluginNode();
    let lastPluginInChain = firstPluginInChain;
    for (let i = 1; i < this.pluginNodeList.length; i++) {
      let curPluginNode = this.pluginNodeList[i].getPluginNode();
      lastPluginInChain.output.connect(curPluginNode.input);
      lastPluginInChain = curPluginNode;
    }
    return { input: firstPluginInChain.input, output: lastPluginInChain.output };
  }

  updateTrackNode(newOutputTrackIndex) {
    for (let i = 0; i < this.pluginNodeList.length; i++) {
      this.pluginNodeList.output.disconnect();
    }
    this.panNode.disconnect();

    this.outputTrackIndex = isNullOrUndefined(newOutputTrackIndex) ? this.outputTrackIndex : newOutputTrackIndex;

    if (!this.mute) {
      if (this.pluginNodeList.length > 0) {
        let pluginChain = this.getPluginChainNode();
        this.panNode.connect(pluginChain.input);
        this.output = pluginChain.output;
      } else {
        this.output = this.panNode;
      }
      if (isNullOrUndefined(this.outputTrackIndex)) {
        this.output.connect(this.context.destination);
      } else if (this.anySolo && this.solo || !this.anySolo) {
        this.output.connect(getTrackByIndex(Store.getState().tracks.trackList, this.outputTrackIndex).trackNode.input);
      }
    }
  }

  updateInstrument(newInstrument) {
    this.instrument.disconnect();
    this.instrument = newInstrument;
    this.instrument.connect(this.input);
  }

  changeVolume(newVolume, changeTime) {
    changeTime = changeTime || this.context.currentTime;
    this.gainNode.gain.exponentialRampToValueAtTime(newVolume, changeTime);
  }

  changePan(newPan, changeTime) {
    changeTime = changeTime || this.context.currentTime;
    this.panNode.pan.setValueAtTime(newPan, changeTime);
  }

  getTrackNode() {
    return { input: this.input, output: this.output }
  }

  addAsLastToChain(node) {
    node.connect(this.input);
    return this.output;
  }

  updateSoloState(soloState, anySolo) {
    this.solo = soloState;
    this.anySolo = anySolo;
    this.updateTrackNode(null)
  }

  updateMuteState() {
    this.mute = !this.mute;
    this.updateTrackNode()
  }

  /**
  * due to initializing web audio api at start of application and sampler is the default instrument
  */
  initContext() {
    if (isNullOrUndefined(this.context)) {
      this.context = Store.getState().webAudio.context;
      this.constructor(this.pluginNodeList, this.instrument, this.outputTrackIndex);
    }
  }
}

export default Track;