import Store from '../stroe';
import { notesToPlay } from 'engine/CompositionParser';
import { updateCurrentTime } from 'actions/controlActions';
import * as Utils from 'engine/Utils';
import { SoundOrigin } from 'constants/Constants';

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
        Store.getState().webAudio.sound.stopAll(SoundOrigin.composition);
        Store.dispatch(updateCurrentTime(this.sixteenthPlaying));
    }
    handlePause(/*event*/) {
        this.timerWorker.postMessage('stop');
        Store.getState().webAudio.sound.stopAll(SoundOrigin.composition);
    }
    schedule() {
        let currentTime = Store.getState().webAudio.context.currentTime;

        currentTime -= this.startTime;

        /**
         * Schedule notes to play for x secounds in advance (in this case, x = 0.26)
         */
        while (this.noteTime < currentTime + 0.200) {
            // Convert noteTime to context time.
            var contextPlayTime = this.noteTime + this.startTime;
            
            let trackList = Store.getState().tracks.trackList;
            let soundHandler = Store.getState().webAudio.sound;
            soundHandler.scheduleStop(this.sixteenthPlaying, contextPlayTime, SoundOrigin.composition);            
            //iterate through all tracks
            for (let i = 0; i < trackList.length; i++) {
                let currTrackIndex = trackList[i].index;
                let currentNotesToPlay = notesToPlay(this.sixteenthPlaying, currTrackIndex);
                if (!Utils.isNullUndefinedOrEmpty(currentNotesToPlay)) {
                    for (let j = 0; j < currentNotesToPlay.length; j++) {
                        soundHandler.play(currTrackIndex, contextPlayTime, Utils.noteToMIDI(currentNotesToPlay[j].note),
                            SoundOrigin.composition, this.sixteenthPlaying +  currentNotesToPlay[j].durotian);
                    }
                }
            }
            this.advenceNote();
        }
    }
    /**
     * change the current note to plan up in time by one sixteenth note time length
     */
    advenceNote() {
        let tempo = Store.getState().control.BPM;
        var secoundsPerBeat = 60.0 / tempo;

        this.sixteenthPlaying++;

        this.noteTime += 0.25 * secoundsPerBeat;
        
        Store.dispatch(updateCurrentTime(this.sixteenthPlaying));
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