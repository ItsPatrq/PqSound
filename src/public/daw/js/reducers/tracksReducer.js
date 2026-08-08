import * as Utils from 'engine/Utils';
import { TrackTypes } from 'constants/Constants';

/**
 * Track descriptors only. The live Web Audio graph for each track lives in
 * engine/AudioEngine, keyed by the track's stable `id`; instruments and
 * plugins are built by the thunks in actions/trackListActions and handed to
 * this reducer already constructed. Nothing here calls `new` or touches an
 * audio node — see #156.
 *
 * Fully copy-on-write: no case writes to an object from the previous state, so
 * the store can run RTK's `immutableCheck`.
 */
// Placeholder descriptor: the real one arrives with INIT_INSTRUMENT_CONTEXT,
// but the UI renders before that and reads .id/.name/.preset off it.
const firstInstrument = { id: null, name: '', preset: null };

/** Replaces the tracks matching `predicate` with `update(track)`. */
const updateTracks = (trackList, predicate, update) =>
    trackList.map((track) => (predicate(track) ? update(track) : track));

const updateTrackAtIndex = (trackList, index, update) =>
    updateTracks(trackList, (track) => track.index === index, update);

/**
 * Moves the track at `movedIndex` by `movedDelta` and the one it swaps with by
 * `otherDelta`, carrying the routing with it: every child's `output` follows its
 * parent, and the parents' entries in their own output's `input` list follow
 * their new index. Used by both reorder actions.
 */
const reorderTracks = (trackList, movedIndex, movedDelta, otherIndex, otherDelta) => {
    const moves = [
        [Utils.getTrackByIndex(trackList, movedIndex), movedDelta],
        [Utils.getTrackByIndex(trackList, otherIndex), otherDelta],
    ].filter(([track]) => !!track);

    const indexDelta = new Map();
    const childOutputDelta = new Map();
    const inputRewrites = new Map();
    moves.forEach(([track, delta]) => {
        indexDelta.set(track.index, delta);
        track.input.forEach((childIndex) => childOutputDelta.set(childIndex, delta));
        const rewrites = inputRewrites.get(track.output) || [];
        rewrites.push([track.index, delta]);
        inputRewrites.set(track.output, rewrites);
    });

    return trackList
        .map((track) => {
            let next = track;
            const rewrites = inputRewrites.get(track.index);
            if (rewrites) {
                const input = [...next.input];
                rewrites.forEach(([entry, delta]) => {
                    const position = input.indexOf(entry);
                    if (position !== -1) {
                        input[position] = input[position] + delta;
                    }
                });
                next = { ...next, input };
            }
            if (childOutputDelta.has(track.index)) {
                next = { ...next, output: next.output + childOutputDelta.get(track.index) };
            }
            if (indexDelta.has(track.index)) {
                next = { ...next, index: next.index + indexDelta.get(track.index) };
            }
            return next;
        })
        .sort((a, b) => a.index - b.index);
};

export default function reducer(
    state = {
        trackList: [
            {
                name: 'Master',
                trackType: TrackTypes.aux,
                pluginList: [],
                volume: 1.0,
                pan: 0,
                record: false,
                mute: false,
                index: 0,
                id: 0,
                output: null, //output: context.destination
                input: [1],
            },
            {
                name: 'multi-oscilator',
                trackType: TrackTypes.virtualInstrument,
                instrument: firstInstrument,
                pluginList: [],
                volume: 1.0,
                pan: 0,
                record: true,
                mute: false,
                solo: false,
                index: 1,
                id: 1,
                output: 0,
                input: [],
            },
        ],
        // Ids are handed out from here and never reused, so the engine's track
        // registry survives the renumbering that remove/reorder does to `index`.
        nextTrackId: 2,
        selected: 1,
        anyVirtualInstrumentSolo: false,
        anyAuxSolo: false,
        showAddNewTrackModal: false,
    },
    action,
) {
    switch (action.type) {
        case 'ADD_TRACK': {
            const newTrackIndex = state.trackList.length;
            const trackList = updateTrackAtIndex(state.trackList, 0, (master) => ({
                ...master,
                input: [...master.input, newTrackIndex],
            }));
            trackList.push({
                name: 'Default',
                trackType: action.payload.trackType,
                instrument: action.payload.instrument,
                pluginList: action.payload.pluginList,
                volume: 1.0,
                pan: 0,
                record: false,
                mute: false,
                solo: false,
                index: newTrackIndex,
                id: action.payload.id,
                output: 0,
                input: [],
            });
            return {
                ...state,
                trackList: trackList,
                nextTrackId: action.payload.id + 1,
            };
        }
        case 'REMOVE_TRACK': {
            // Master (position 0) is never removable.
            const position = state.trackList.findIndex((track, i) => i >= 1 && track.index === action.payload);
            if (position === -1) {
                return state;
            }
            const removed = state.trackList[position];
            const selected = state.selected === state.trackList.length - 1 ? state.selected - 1 : state.selected;

            // Re-parent the removed track's children onto its own output, then
            // drop it and close the gap its index left behind.
            const rewired = state.trackList.map((track) => {
                if (track.index === removed.output) {
                    return {
                        ...track,
                        input: track.input.filter((entry) => entry !== action.payload).concat(removed.input),
                    };
                }
                if (removed.input.includes(track.index)) {
                    return { ...track, output: removed.output };
                }
                return track;
            });
            const trackList = rewired
                .filter((track, i) => i !== position)
                .map((track) => ({
                    ...track,
                    input: track.input.map((entry) => (entry >= position ? entry - 1 : entry)),
                    output: track.output >= position ? track.output - 1 : track.output,
                    index: track.index >= position ? track.index - 1 : track.index,
                }));
            return {
                ...state,
                trackList: trackList,
                selected: selected,
            };
        }
        case 'CHANGE_RECORD_STATE': {
            return {
                ...state,
                trackList: updateTrackAtIndex(state.trackList, action.payload, (track) => ({
                    ...track,
                    record: !track.record,
                })),
            };
        }
        case 'CHANGE_TRACK_SOLO_STATE': {
            // Master (position 0) has no solo of its own.
            const trackList = state.trackList.map((track, i) =>
                i >= 1 && track.index === action.payload ? { ...track, solo: !track.solo } : track,
            );
            let newAnyVirtualInstrumentSolo = false;
            let newAnyAuxSolo = false;
            for (let i = 1; i < trackList.length; i++) {
                if (trackList[i].solo) {
                    if (trackList[i].trackType === TrackTypes.virtualInstrument) {
                        newAnyVirtualInstrumentSolo = true;
                    } else if (trackList[i].trackType === TrackTypes.aux) {
                        newAnyAuxSolo = true;
                    }
                }
            }
            return {
                ...state,
                trackList: trackList,
                anyVirtualInstrumentSolo: newAnyVirtualInstrumentSolo,
                anyAuxSolo: newAnyAuxSolo,
            };
        }
        case 'CHANGE_TRACK_MUTE_STATE': {
            return {
                ...state,
                trackList: updateTrackAtIndex(state.trackList, action.payload, (track) => ({
                    ...track,
                    mute: !track.mute,
                })),
            };
        }
        case 'CHANGE_TRACK_NAME': {
            return {
                ...state,
                trackList: updateTrackAtIndex(state.trackList, action.payload.index, (track) => ({
                    ...track,
                    name: action.payload.newTrackName,
                })),
            };
        }
        case 'CHANGE_SELECTED_TRACK': {
            // With exactly one track armed, selecting moves the arm; with
            // several, selecting only adds one. Aux tracks are never armed.
            const armedCount = state.trackList.filter((track) => track.record).length;
            const trackList = state.trackList.map((track) => {
                let record = track.record;
                if (armedCount === 1 && record) {
                    record = false;
                }
                if (track.index === action.payload) {
                    record = true;
                }
                if (record && track.trackType === TrackTypes.aux) {
                    record = false;
                }
                return record === track.record ? track : { ...track, record };
            });
            return {
                ...state,
                trackList: trackList,
                selected: action.payload,
            };
        }
        case 'INIT_INSTRUMENT_CONTEXT': {
            return {
                ...state,
                trackList: updateTrackAtIndex(state.trackList, action.payload.index, (track) => ({
                    ...track,
                    instrument: action.payload.instrument,
                })),
            };
        }
        case 'CHANGE_TRACK_VOLUME': {
            return {
                ...state,
                trackList: updateTrackAtIndex(state.trackList, action.payload.index, (track) => ({
                    ...track,
                    volume: action.payload.volume,
                })),
            };
        }
        case 'CHANGE_TRACK_PAN': {
            return {
                ...state,
                trackList: updateTrackAtIndex(state.trackList, action.payload.index, (track) => ({
                    ...track,
                    pan: action.payload.pan,
                })),
            };
        }
        case 'CHANGE_TRACK_INSTRUMENT': {
            return {
                ...state,
                trackList: updateTrackAtIndex(state.trackList, action.payload.index, (track) => ({
                    ...track,
                    instrument: action.payload.instrument,
                })),
            };
        }
        case 'CHANGE_TRACK_OUTPUT': {
            const track = Utils.getTrackByIndex(state.trackList, action.payload.index);
            if (!track) {
                return state;
            }
            // Sequential, so a track that is both the old and the new output
            // (or the moved track itself) picks up every applicable change.
            const trackList = state.trackList.map((curr) => {
                let next = curr;
                if (curr.index === action.payload.index) {
                    next = { ...next, output: action.payload.outputIndex };
                }
                if (curr.index === track.output) {
                    next = { ...next, input: next.input.filter((entry) => entry !== action.payload.index) };
                }
                if (curr.index === action.payload.outputIndex) {
                    next = { ...next, input: [...next.input, action.payload.index] };
                }
                return next;
            });
            return {
                ...state,
                trackList: trackList,
            };
        }
        case 'ADD_NEW_TRACK_MODAL_VISIBILITY_SWITCH': {
            return {
                ...state,
                showAddNewTrackModal: !state.showAddNewTrackModal,
            };
        }
        case 'TRACK_INDEX_UP': {
            return {
                ...state,
                trackList: reorderTracks(state.trackList, action.payload, 1, action.payload + 1, -1),
            };
        }
        case 'TRACK_INDEX_DOWN': {
            return {
                ...state,
                trackList: reorderTracks(state.trackList, action.payload, -1, action.payload - 1, 1),
            };
        }
        case 'SET_TRACK_PLUGINS': {
            // The engine owns the live chain and hands over the whole
            // descriptor list after every add/remove.
            return {
                ...state,
                trackList: updateTrackAtIndex(state.trackList, action.payload.index, (track) => ({
                    ...track,
                    pluginList: action.payload.pluginList,
                })),
            };
        }
        case 'LOAD_TRACK_STATE': {
            // The thunk has already built the instruments, plugins and track
            // graphs; this only swaps in the finished descriptors.
            return {
                ...state,
                ...action.payload,
            };
        }
        case 'UPDATE_INSTRUMENT_PRESET': {
            // The live instrument is updated by the thunk; the descriptor keeps
            // the store's copy of the preset in step for rendering and export.
            return {
                ...state,
                trackList: updateTracks(
                    state.trackList,
                    (track) => track.index === action.payload.index && !!track.instrument,
                    (track) => ({
                        ...track,
                        instrument: { ...track.instrument, preset: action.payload.preset },
                    }),
                ),
            };
        }
        case 'CHANGE_PLUGIN_PRESET': {
            // The live plugin is updated by the thunk; the descriptor keeps the
            // store's copy of the preset in step for rendering and export.
            return {
                ...state,
                trackList: updateTrackAtIndex(state.trackList, action.payload.index, (track) => ({
                    ...track,
                    pluginList: track.pluginList.map((plugin) =>
                        plugin.index === action.payload.pluginIndex
                            ? { ...plugin, preset: action.payload.preset }
                            : plugin,
                    ),
                })),
            };
        }
    }
    return state;
}
