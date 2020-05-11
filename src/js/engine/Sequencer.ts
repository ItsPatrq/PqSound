import Store from '../stroe';
import { notesToPlay } from './CompositionParser';
import { updateCurrentTime } from '../actions/controlActions';
import * as Utils from './Utils';
import { SoundOrigin } from '../constants/Constants';

class Sequencer {
    noteTime?: number;
    startTime?: number;
    timerWorker?: Worker;
    sixteenthPlaying = 0;
    timeoutId?: number;
    scheduleAhead = 0.200;
    handlePlay() {
        this.noteTime = 0.0;
        this.startTime = (Store.getState().webAudio as any).context.currentTime + 0.005;
        this.schedule();
        this.timerWorker!.postMessage('start');
    }
    handleStop(/*event*/) {
        this.timerWorker!.postMessage('stop');
        setTimeout(() => {
            (Store.getState().webAudio as any).sound.stopAll(SoundOrigin.composition);
            this.sixteenthPlaying = 0;
            Store.dispatch(updateCurrentTime(this.sixteenthPlaying));
        },80);
            
    }
    handlePause(/*event*/) {
        this.timerWorker!.postMessage('stop');
        (Store.getState().webAudio as any).sound.stopAll(SoundOrigin.composition);
    }
    schedule() {
        let currentTime = ((Store.getState().webAudio as any).context as AudioContext).currentTime;

        currentTime -= this.startTime!;

        /**
         * Schedule notes to play for x secounds in advance (in this case, x = 0.200)
         */
        while (this.noteTime! < currentTime + this.scheduleAhead) {
            // Convert noteTime to context time.
            const contextPlayTime = this.noteTime! + this.startTime!;
            
            const trackList = (Store.getState().tracks as any).trackList;
            const soundHandler = (Store.getState().webAudio as any).sound;
            soundHandler.scheduleStop(this.sixteenthPlaying, contextPlayTime, SoundOrigin.composition);
            //iterate through all tracks
            for (let i = 0; i < trackList.length; i++) {
                const currTrackIndex = trackList[i].index;
                const currentNotesToPlay = notesToPlay(this.sixteenthPlaying, currTrackIndex);
                if (!Utils.isNullUndefinedOrEmpty(currentNotesToPlay)) {
                    for (let j = 0; j < currentNotesToPlay!.length; j++) {
                        soundHandler.play(currTrackIndex, contextPlayTime, Utils.noteToMIDI(currentNotesToPlay![j].note),
                            SoundOrigin.composition, this.sixteenthPlaying +  currentNotesToPlay![j].duration);
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
        const tempo = Store.getState().control.BPM;
        const secoundsPerBeat = 60.0 / tempo;

        this.sixteenthPlaying++;

        this.noteTime! += 0.25 * secoundsPerBeat;
        
        Store.dispatch(updateCurrentTime(this.sixteenthPlaying));
    }
    init() {
        const schedule = this.schedule;
        const timerWorkerBlob = new Blob([
            'var timeoutID=0;' +
            'function schedule(){timeoutID=setTimeout(function(){postMessage(\'schedule\'); schedule();},80);}' +
            'onmessage = function(e) { if (e.data == \'start\') { if (!timeoutID) schedule();} else if (e.data == \'stop\') {if (timeoutID) clearTimeout(timeoutID);' +
            'timeoutID=0;};}']);

        // Obtain a blob URL reference to our worker 'file'.
        const timerWorkerBlobURL = window.URL.createObjectURL(timerWorkerBlob);

        this.timerWorker = new Worker(timerWorkerBlobURL);
        this.timerWorker.onmessage = function (/*e*/) {
            schedule();
        };
        this.timerWorker.postMessage('init'); // Start the worker.
    }
}

export default Sequencer;