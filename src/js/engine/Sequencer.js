import Store from '../stroe';
import { notesToPlay } from 'engine/CompositionParser';
import * as Utils from 'engine/Utils';

class Sequencer {
    constructor() {
        this.noteTime = null;
        this.startTime = null;
        this.sixteenthPlaying = 0;
        this.timeoutId = null;
        this.timerWorker = null;
    }
    handlePlay() {
        this.noteTime = 0.0;
        this.startTime = Store.getState().webAudio.context.currentTime + 0.005;
        this.schedule();
        this.timerWorker.postMessage('start');
    }
    handleStop(/*event*/) {
        this.timerWorker.postMessage('stop');
        this.sixteenthPlaying = 0;
    }
    handlePause(/*event*/){
        this.timerWorker.postMessage('stop');
    }
    schedule() {
        let currentTime = Store.getState().webAudio.context.currentTime;

        currentTime -= this.startTime;

        while (this.noteTime < currentTime + 0.120) {
            // Convert noteTime to context time.
            var contextPlayTime = this.noteTime + this.startTime;
            
            //iterate through all tracks
            for (let i = 0; i < Store.getState().tracks.trackList.length; i++) {
                let currentNotesToPlay = notesToPlay(this.sixteenthPlaying, Store.getState().tracks.trackList[i].index);
                if(!Utils.isNullUndefinedOrEmpty(currentNotesToPlay)){
                    for(let j = 0; j < currentNotesToPlay.length; j++){
                        Store.getState().tracks.trackList[i].sound.play(contextPlayTime, currentNotesToPlay[j].note);
                    }
                }
            }
            this.advenceNote();
        }
    }
    advenceNote() {
        let tempo = Store.getState().control.BPM;
        var secoundsPerBeat = 60.0 / tempo;

        this.sixteenthPlaying++;

        this.noteTime += 0.25 * secoundsPerBeat;
    }
    init() {
        var that = this;
        var timerWorkerBlob = new Blob([
            'var timeoutID=0;' +
            'function schedule(){timeoutID=setTimeout(function(){postMessage(\'schedule\'); schedule();},100);}' +
            'onmessage = function(e) { if (e.data == \'start\') { if (!timeoutID) schedule();} else if (e.data == \'stop\') {if (timeoutID) clearTimeout(timeoutID);' +
            'timeoutID=0;};}']);

        // Obtain a blob URL reference to our worker 'file'.
        var timerWorkerBlobURL = window.URL.createObjectURL(timerWorkerBlob);

        this.timerWorker = new Worker(timerWorkerBlobURL);
        this.timerWorker.onmessage = function (/*e*/) {
            that.schedule();
        };
        this.timerWorker.postMessage('init'); // Start the worker.
    }
}

export default Sequencer;