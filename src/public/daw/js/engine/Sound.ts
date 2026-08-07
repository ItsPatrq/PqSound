import * as Utils from './Utils';
import { SoundOrigin } from '../constants/Constants';

/**
 * The store is resolved lazily. Importing it at module scope closes an import
 * cycle (stroe -> reducers -> tracksReducer -> instruments -> AudioEngine ->
 * Sound), which left the reducers half-initialized when the store was created.
 * Reading it at call time keeps the cycle out of module evaluation. The
 * dependency itself goes away with the engine -> store inversion (#156).
 */
const getStore = () => require('../stroe').default;

export default class Sound {
    context: AudioContext;
    playingSounds: any[][];
    constructor(newContext: AudioContext) {
        if (newContext.state !== 'running') {
            newContext.resume();
        }
        this.context = newContext;
        this.playingSounds = [[], [], []]; // trackindex, note, origin, endindex
    }

    scheduleStop(sixteenthPlaying: number, contextPlayTime: number, origin: number, loopEndSixteenth?: number) {
        for (let i = this.playingSounds[origin].length - 1; i >= 0; i--) {
            const currNote = this.playingSounds[origin][i];
            // On a loop wrap the play position jumps past loopEndSixteenth, so a note
            // whose endIndex sits at/after the loop end would never match the exact
            // comparison and would drone forever. Flush those at the boundary too.
            const reachedEnd = currNote.endIndex === sixteenthPlaying;
            const pastLoopEnd = loopEndSixteenth !== undefined && currNote.endIndex >= loopEndSixteenth;
            if (reachedEnd || pastLoopEnd) {
                this.stop(currNote.trackIndex, currNote.note, contextPlayTime);
                this.playingSounds[origin].splice(i, 1);
            }
        }
    }

    stopAll(origin: number) {
        for (let i = 0; i < this.playingSounds[origin].length; i++) {
            this.stop(this.playingSounds[origin][i].trackIndex, this.playingSounds[origin][i].note);
        }
        this.playingSounds[origin].length = 0;
    }

    play(trackIndex, contextPlayTime, note, origin, endIndex?) {
        if (Utils.isNullOrUndefined(contextPlayTime)) {
            contextPlayTime = this.context.currentTime + 0.001;
        }
        if (origin === SoundOrigin.composition) {
            this.playingSounds[origin].push({ trackIndex: trackIndex, note: note, origin: origin, endIndex: endIndex });
        }

        const currTrack = Utils.getTrackByIndex((getStore().getState().tracks as any).trackList, trackIndex);
        currTrack.instrument.noteOn(note, contextPlayTime);
    }

    stop(trackIndex: number, note: number, contextStopTime?: number) {
        if (Utils.isNullOrUndefined(contextStopTime)) {
            contextStopTime = this.context.currentTime + 0.001;
        }
        const currTrack = Utils.getTrackByIndex((getStore().getState().tracks as any).trackList, trackIndex);
        currTrack.instrument.noteOff(note, contextStopTime);
    }
}
