import * as EngineStore from './EngineStore';
import AudioEngine from './AudioEngine';
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
        const audioContext = AudioEngine.getContext()!;
        // A stop within the last 80 ms still has its reset pending; let it fire
        // and it would stopAll() the notes this run is about to schedule and
        // snap the playhead back to 0 mid-playback (#250).
        this.cancelPendingStop();
        AudioEngine.resume();
        this.noteTime = 0.0;
        this.startTime = audioContext.currentTime + 0.005;
        this.schedule();
        this.timerWorker!.postMessage('start');
    }
    /**
     * Drops a reset queued by handleStop. The id is kept so play/pause can
     * cancel it — the delay exists to let already-scheduled notes ring out, not
     * to reach across a later transport action.
     */
    cancelPendingStop() {
        if (this.timeoutId !== undefined) {
            clearTimeout(this.timeoutId);
            this.timeoutId = undefined;
        }
    }
    handleStop(/*event*/) {
        this.timerWorker!.postMessage('stop');
        this.cancelPendingStop();
        this.timeoutId = setTimeout(() => {
            this.timeoutId = undefined;
            AudioEngine.getSound()!.stopAll(SoundOrigin.composition);
            this.sixteenthPlaying = 0;
            EngineStore.dispatch(updateCurrentTime(this.sixteenthPlaying));
        }, 80) as unknown as number;
    }
    handlePause(/*event*/) {
        this.timerWorker!.postMessage('stop');
        // Pause holds the playhead where it is; a pending stop would reset it to 0.
        this.cancelPendingStop();
        AudioEngine.getSound()!.stopAll(SoundOrigin.composition);
    }
    schedule = () => {
        let currentTime = AudioEngine.getContext()!.currentTime;

        currentTime -= this.startTime!;

        /**
         * Schedule notes to play for x secounds in advance (in this case, x = 0.200)
         */
        while (this.noteTime! < currentTime + this.scheduleAhead) {
            // Convert noteTime to context time.
            const contextPlayTime = this.noteTime! + this.startTime!;

            const snapshot = EngineStore.getSnapshot();
            const soundHandler = AudioEngine.getSound()!;
            // When the play position is sitting on loopStart (i.e. it just wrapped),
            // flush any note whose end fell at/after the loop end — otherwise the exact
            // endIndex match is skipped by the wrap and the note hangs.
            const loopEndFlush =
                snapshot.loopEnabled && this.sixteenthPlaying === snapshot.loopStart * 16
                    ? snapshot.loopEnd * 16
                    : undefined;
            soundHandler.scheduleStop(this.sixteenthPlaying, contextPlayTime, SoundOrigin.composition, loopEndFlush);
            //iterate through all tracks
            for (let i = 0; i < snapshot.tracks.length; i++) {
                const currTrackIndex = snapshot.tracks[i].index;
                const currentNotesToPlay = notesToPlay(this.sixteenthPlaying, currTrackIndex, snapshot.regionList);
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
        const snapshot = EngineStore.getSnapshot();
        const secoundsPerBeat = 60.0 / snapshot.bpm;

        this.sixteenthPlaying++;

        this.noteTime! += 0.25 * secoundsPerBeat;

        // Loop: wrap the pattern position back to loopStart when it reaches loopEnd.
        // noteTime (the audio clock) keeps marching forward — only the sixteenth index
        // wraps, so the loop range replays without a gap.
        if (snapshot.loopEnabled) {
            const loopEndSixteenth = snapshot.loopEnd * 16;
            const loopStartSixteenth = snapshot.loopStart * 16;
            if (loopEndSixteenth > loopStartSixteenth && this.sixteenthPlaying >= loopEndSixteenth) {
                this.sixteenthPlaying = loopStartSixteenth;
            }
        }

        EngineStore.dispatch(updateCurrentTime(this.sixteenthPlaying));
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
        // The worker keeps its own reference to the script once constructed, so
        // the URL can be released immediately rather than leaked for the life
        // of the page (#250).
        window.URL.revokeObjectURL(timerWorkerBlobURL);
        this.timerWorker.onmessage = function (/*e*/) {
            schedule();
        };
        this.timerWorker.postMessage('init'); // Start the worker.
    }
}

export default Sequencer;
