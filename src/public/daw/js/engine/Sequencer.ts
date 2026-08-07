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
    scheduleAhead = 0.2;
    handlePlay() {
        const audioContext: AudioContext = (Store.getState().webAudio as any).context;
        if (audioContext.state !== 'running') {
            audioContext.resume();
        }
        this.noteTime = 0.0;
        this.startTime = audioContext.currentTime + 0.005;
        this.schedule();
        this.timerWorker!.postMessage('start');
    }
    handleStop(/*event*/) {
        this.timerWorker!.postMessage('stop');
        setTimeout(() => {
            (Store.getState().webAudio as any).sound.stopAll(SoundOrigin.composition);
            this.sixteenthPlaying = 0;
            Store.dispatch(updateCurrentTime(this.sixteenthPlaying));
        }, 80);
    }
    handlePause(/*event*/) {
        this.timerWorker!.postMessage('stop');
        (Store.getState().webAudio as any).sound.stopAll(SoundOrigin.composition);
    }
    schedule = () => {
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
            // When the play position is sitting on loopStart (i.e. it just wrapped),
            // flush any note whose end fell at/after the loop end — otherwise the exact
            // endIndex match is skipped by the wrap and the note hangs.
            const composition = Store.getState().composition as any;
            const loopEndFlush =
                composition.loopEnabled && this.sixteenthPlaying === composition.loopStart * 16
                    ? composition.loopEnd * 16
                    : undefined;
            soundHandler.scheduleStop(this.sixteenthPlaying, contextPlayTime, SoundOrigin.composition, loopEndFlush);
            //iterate through all tracks
            for (let i = 0; i < trackList.length; i++) {
                const currTrackIndex = trackList[i].index;
                const currentNotesToPlay = notesToPlay(this.sixteenthPlaying, currTrackIndex);
                if (!Utils.isNullUndefinedOrEmpty(currentNotesToPlay)) {
                    for (let j = 0; j < currentNotesToPlay!.length; j++) {
                        soundHandler.play(
                            currTrackIndex,
                            contextPlayTime,
                            Utils.noteToMIDI(currentNotesToPlay![j].note),
                            SoundOrigin.composition,
                            this.sixteenthPlaying + currentNotesToPlay![j].duration,
                        );
                    }
                }
            }
            this.advenceNote();
        }
    };
    /**
     * change the current note to plan up in time by one sixteenth note time length
     */
    advenceNote() {
        const tempo = Store.getState().control.BPM;
        const secoundsPerBeat = 60.0 / tempo;

        this.sixteenthPlaying++;

        this.noteTime! += 0.25 * secoundsPerBeat;

        // Loop: wrap the pattern position back to loopStart when it reaches loopEnd.
        // noteTime (the audio clock) keeps marching forward — only the sixteenth index
        // wraps, so the loop range replays without a gap.
        const composition = Store.getState().composition as any;
        if (composition.loopEnabled) {
            const loopEndSixteenth = composition.loopEnd * 16;
            const loopStartSixteenth = composition.loopStart * 16;
            if (loopEndSixteenth > loopStartSixteenth && this.sixteenthPlaying >= loopEndSixteenth) {
                this.sixteenthPlaying = loopStartSixteenth;
            }
        }

        Store.dispatch(updateCurrentTime(this.sixteenthPlaying));
    }
    init() {
        const schedule = this.schedule;
        const timerWorkerBlob = new Blob([
            'var timeoutID=0;' +
                "function schedule(){timeoutID=setTimeout(function(){postMessage('schedule'); schedule();},80);}" +
                "onmessage = function(e) { if (e.data == 'start') { if (!timeoutID) schedule();} else if (e.data == 'stop') {if (timeoutID) clearTimeout(timeoutID);" +
                'timeoutID=0;};}',
        ]);

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
