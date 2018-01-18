import Store from '../stroe';
import * as Utils from 'engine/Utils';
import { SoundOrigin } from 'constants/Constants';

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
      contextPlayTime = this.context.currentTime + 0.001;
    }
    if(origin === SoundOrigin.composition){
      this.playingSounds[origin].push({ trackIndex: trackIndex, note: note, origin: origin, endIndex: endIndex });
    }

    let currTrack = Utils.getTrackByIndex(Store.getState().tracks.trackList, trackIndex);
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
}