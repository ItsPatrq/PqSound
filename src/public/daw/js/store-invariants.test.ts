/**
 * @jest-environment jsdom
 */
import { configureStore } from '@reduxjs/toolkit';
import reducer from './slices';
import * as tracks from './slices/tracksSlice';
import * as composition from './slices/compositionSlice';
import * as control from './slices/controlSlice';
import * as keyboard from './slices/keyboardSlice';
import * as webAudio from './slices/webAudioSlice';
import * as trackDetails from './slices/trackDetailsSlice';

/**
 * #156's invariant, asserted per action rather than per user journey.
 *
 * `playwright/ui-integrations/serializability.spec.ts` guards the same thing,
 * but only for the reducers its flow happens to walk past — `changeRecordState`
 * went unguarded from the day that spec was written until #279, and the gap was
 * found by accident. This closes it structurally: every exported action creator
 * is dispatched against a real store, and the run fails if RTK's
 * serializableCheck or immutableCheck says anything.
 *
 * The `has an argument list for every creator` case is the point of the file —
 * adding a creator without covering it fails here rather than silently going
 * unchecked.
 */
const slices = {
    tracks,
    composition,
    control,
    keyboard,
    webAudio,
    trackDetails,
};

const instrumentDescriptor = { id: 1, name: 'MultiOsc', preset: { attack: 0 } };
const pluginDescriptor = { id: 0, name: 'Equalizer', index: 0, preset: { lowFilterGain: 1 } };

/**
 * Arguments per creator, in the shape the app dispatches them. Payloads are
 * deliberately realistic — a creator handed `undefined` would pass the checks
 * without ever building the state shape the reducer really produces.
 */
const args: Record<string, Record<string, unknown[]>> = {
    tracks: {
        addTrack: [1, instrumentDescriptor, [pluginDescriptor], 2],
        removeTrack: [1],
        changeRecordState: [1],
        changeSoloState: [1],
        changeMuteState: [1],
        changeTrackName: ['renamed', 1],
        changeSelectedTrack: [1],
        initInstrumentContext: [1, instrumentDescriptor],
        changeTrackVolume: [1, 0.5],
        changeTrackPan: [1, -20],
        changeTrackInstrument: [1, instrumentDescriptor],
        changeTrackOutput: [1, 0],
        addNewTrackModalVisibilitySwitch: [undefined],
        trackIndexUp: [1],
        trackIndexDown: [1],
        setTrackPlugins: [1, [pluginDescriptor]],
        loadTrackState: [{ trackList: [], nextTrackId: 5, selected: 0 }],
        updateInstrumentPreset: [{ attack: 0.2 }, 1],
        changePluginPreset: [1, 0, { lowFilterGain: 0.5 }],
    },
    composition: {
        removeTrackFromComposition: [1],
        addRegion: [1, 0, 2],
        pasteRegion: [1, 4, 1],
        removeRegion: [1],
        addNote: [1, 40, 0, 1],
        removeNote: [1, 40, 0, 1],
        showPianoRoll: [1, 1],
        switchPianorollVisibility: [true],
        switchMixerVisibility: [true],
        changeBarsInComposition: [64],
        switchLoop: [true],
        changeLoopRange: [0, 8],
        loadCompositionState: [{ barsInComposition: 48, regionList: [], regionLastId: 0 }],
        regionTrackIndexUp: [1],
        regionTrackIndexDown: [1],
    },
    control: {
        switchPlayState: [true],
        changeBPM: [140],
        changeTool: [1],
        changeSecoundaryTool: [1],
        changeRegionDrawLength: [2],
        changeNoteDrawLength: [2],
        updateCurrentTime: [16],
        setCurrentTime: [16],
        updateMidiState: [{ connected: true }],
        switchAltKey: [true],
        switchUploadModalVisibility: [true],
        switchAboutModalVisibility: [true],
        loadControlState: [{ BPM: 128 }],
        textInputFocusedSwitch: [true],
        copyRegion: [1],
    },
    keyboard: {
        changeOctaveNumber: [4],
        switchKeyboardVisibility: [undefined],
        updateWidth: [800],
        changeFirstKeyboardKey: [36],
        addPlayingNote: [60],
        removePlayingNote: [60],
        changeKeyBindings: [{ a: { MIDINote: 60 } }],
        switchKeyNameVisibility: [undefined],
        switchKeyBindVisibility: [undefined],
    },
    webAudio: {
        initWebAudio: [{ initialized: true, sampleRate: 44100 }],
        samplerInstrumentFetching: [{ instrumentId: 0 }],
        samplerInstrumentFetched: [{ id: 0 }],
    },
    trackDetails: {
        instrumentModalVisibilitySwitch: [true],
        pluginModalVisibilitySwitch: [0, 1],
    },
};

/** Exported action creators, excluding the default reducer export. */
const creatorsOf = (slice: Record<string, unknown>): string[] =>
    Object.keys(slice).filter((key) => key !== 'default' && typeof slice[key] === 'function');

const cases: [string, string][] = Object.entries(slices).flatMap(([name, slice]) =>
    creatorsOf(slice as Record<string, unknown>).map((creator) => [name, creator] as [string, string]),
);

describe('store invariants, per action creator', () => {
    let errorSpy: jest.SpyInstance;

    beforeEach(() => {
        errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    });
    afterEach(() => {
        errorSpy.mockRestore();
    });

    it('has an argument list for every exported creator', () => {
        const missing = cases
            .filter(([slice, creator]) => !(creator in (args[slice] || {})))
            .map(([slice, creator]) => `${slice}.${creator}`);

        // A new creator lands here rather than silently going unchecked.
        expect(missing).toEqual([]);
    });

    it.each(cases)('%s.%s keeps state serializable and immutable', (sliceName, creator) => {
        // A fresh store per case: the checks report the first offence only, so a
        // shared store would let an early failure mask later ones.
        const store = configureStore({
            reducer,
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware({ serializableCheck: true, immutableCheck: true }),
        });

        const action = (slices as any)[sliceName][creator](...(args[sliceName][creator] as any[]));
        store.dispatch(action);

        const complaints = errorSpy.mock.calls
            .map((call) => String(call[0]))
            .filter(
                (text) =>
                    text.includes('non-serializable') ||
                    text.includes('A state mutation was detected') ||
                    text.includes('immutableStateInvariant') ||
                    text.includes('serializableStateInvariant'),
            );

        expect(complaints).toEqual([]);
    });
});
