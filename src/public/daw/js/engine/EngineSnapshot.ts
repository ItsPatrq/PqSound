/**
 * The slice of store state the engine is allowed to see.
 *
 * The scheduler, the note dispatcher and the MIDI controller used to reach into
 * the store for whatever they needed. They now read this snapshot, which the
 * store pushes on every change — so the engine depends on a small, explicit
 * shape instead of on the store's layout (#156).
 *
 * Keep it flat and serializable: anything live belongs in AudioEngine.
 */
export interface EngineTrack {
    index: number;
    id: number;
    record: boolean;
}

export interface EngineSnapshot {
    bpm: number;
    loopEnabled: boolean;
    loopStart: number;
    loopEnd: number;
    regionList: any[];
    tracks: EngineTrack[];
    notesPlaying: number[];
}

export const emptySnapshot: EngineSnapshot = {
    bpm: 120,
    loopEnabled: false,
    loopStart: 0,
    loopEnd: 0,
    regionList: [],
    tracks: [],
    notesPlaying: [],
};

/**
 * Projects store state down to what the engine needs. Pure.
 *
 * Runs once per store change, not per read. Measured cost (Node 23, M-series):
 * 36 ns for the default 2-track project, 90 ns at 16 tracks / 200 regions,
 * 384 ns at an absurd 64 tracks / 1000 regions. The scheduler dispatches
 * UPDATE_CURRENT_TIME 8×/second at 120 BPM, so the realistic total is ~0.0008
 * ms per second of playback. Memoizing it (reselect) was considered and
 * rejected: there is nothing here to save. Cost scales with track count only —
 * `regionList` and `notesPlaying` are passed by reference.
 */
export function selectEngineSnapshot(state: any): EngineSnapshot {
    return {
        bpm: state.control.BPM,
        loopEnabled: state.composition.loopEnabled,
        loopStart: state.composition.loopStart,
        loopEnd: state.composition.loopEnd,
        regionList: state.composition.regionList,
        tracks: state.tracks.trackList.map((track: any) => ({
            index: track.index,
            id: track.id,
            record: !!track.record,
        })),
        notesPlaying: state.keyboard.notesPlaying,
    };
}
