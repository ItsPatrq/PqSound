import { isNullOrUndefined, getTrackByIndex, devLog } from 'engine/Utils';
class Track {
  constructor(newPluginList, newInstrument, newDestTrack, audioContext, newVolume = 1.0, newPan = 0.0) {
    this.pluginNodeList = newPluginList;
    this.destTrack = newDestTrack;
    this.instrument = newInstrument;
    this.solo = false;
    this.mute = false;
    this.anySolo = false;
    if (!isNullOrUndefined(audioContext)) {
      this.context = audioContext;
      this.gainNode = this.context.createGain();
      this.muteNode = this.context.createGain();
      this.panNode = this.context.createStereoPanner();

      this.leftAnalyserNode = this.context.createAnalyser();
      this.rightAnalyserNode = this.context.createAnalyser();
      this.splitter = this.context.createChannelSplitter(2);

      this.gainNode.connect(this.panNode);
      this.input = this.gainNode;
      this.panNode.connect(this.splitter);
      this.output = this.panNode;
      this.splitter.connect(this.leftAnalyserNode,0,0);
      this.splitter.connect(this.rightAnalyserNode,1,0);

      this.gainNode.gain.setValueAtTime(newVolume, this.context.currentTime);
      this.muteNode.gain.setValueAtTime(0.000001, this.context.currentTime);
      this.panNode.pan.setValueAtTime(newPan, this.context.currentTime);

      this.leftAnalyserNode.smoothingTimeConstant = 0.3;
      this.leftAnalyserNode.fftSize = 1024;
      this.rightAnalyserNode.smoothingTimeConstant = 0.3;
      this.rightAnalyserNode.fftSize = 1024;


      if (isNullOrUndefined(this.destTrack)) {
        this.output.connect(this.context.destination);
      } else {
        this.output.connect(this.destTrack)
      }
      if (!isNullOrUndefined(newInstrument)) {
        newInstrument.connect(this.input);
      }
    } else {
      devLog("Error initializing track")
    }
  }
getAverageVolume(){
  if(!this.context || !this.leftAnalyserNode || !this.rightAnalyserNode ){
    return {left: 0, right: 0}
  }
  let leftArray =  new Uint8Array(this.leftAnalyserNode.frequencyBinCount);
  let rightArray =  new Uint8Array(this.rightAnalyserNode.frequencyBinCount);
  this.leftAnalyserNode.getByteFrequencyData(leftArray);
  this.rightAnalyserNode.getByteFrequencyData(rightArray);

  let leftValues = 0;
  let rightValues = 0;

  var length = leftArray.length;

  // get all the frequency amplitudes
  for (var i = 0; i < length; i++) {
    leftValues += leftArray[i];
    rightValues += rightArray[i];
  }
  
  return {left: leftValues / length, right: rightValues / length};
}

  getPluginChainNode() {
    let firstPluginInChain = this.pluginNodeList[0].getPluginNode();
    let lastPluginInChain = this.pluginNodeList[0].getPluginNode();
    for (let i = 1; i < this.pluginNodeList.length; i++) {
      let curPluginNode = this.pluginNodeList[i].getPluginNode();
      lastPluginInChain.output.connect(curPluginNode.input);
      lastPluginInChain = curPluginNode;
    }
    return { input: firstPluginInChain.input, output: lastPluginInChain.output };
  }

  updateTrackNode(newDestTrack) {
    for (let i = 0; i < this.pluginNodeList.length; i++) {
      this.pluginNodeList[i].output.disconnect();
    }
    this.panNode.disconnect();

    this.destTrack = isNullOrUndefined(newDestTrack) ? this.destTrack : newDestTrack;

    if (!this.mute) {
      if (this.pluginNodeList.length > 0) {
        let pluginChain = this.getPluginChainNode();
        this.panNode.connect(pluginChain.input);
        this.output = pluginChain.output;
        pluginChain.output.connect(this.splitter);
      } else {
        this.output = this.panNode;
        this.panNode.connect(this.splitter);
      }
      if (isNullOrUndefined(this.destTrack)) {
        this.output.connect(this.context.destination);
      } else if (this.anySolo && this.solo || !this.anySolo) {
        this.output.connect(this.destTrack);
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
    this.gainNode.gain.setValueAtTime(newVolume, changeTime);
  }

  changePan(newPan, changeTime) {
    changeTime = changeTime || this.context.currentTime;
    this.panNode.pan.setValueAtTime(newPan/100, changeTime);
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
    this.updateTrackNode()
  }

  updateMuteState() {
    this.mute = !this.mute;
    this.updateTrackNode()
  }

  /**
  * due to initializing web audio api at start of application and sampler is the default instrument
  */
  initContext(audioContext, destTrack) {
    if (isNullOrUndefined(this.context)) {
      this.context = audioContext;
      this.constructor(this.pluginNodeList, this.instrument, destTrack, audioContext);
    }
  }
}


export default Track;