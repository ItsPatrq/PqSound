import Store from '../stroe';
import Sequencer from './Sequencer';
import { updateCurrentTime } from '../actions/controlActions';
import { SoundOrigin } from '../constants/Constants';

jest.mock('../stroe', () => ({
    __esModule: true,
    default: {
        getState: jest.fn(),
        dispatch: jest.fn(),
    },
}));

jest.mock('../actions/controlActions', () => ({
    updateCurrentTime: jest.fn((time) => ({ type: 'UPDATE_CURRENT_TIME', payload: time })),
}));

const mockedGetState = Store.getState as jest.Mock;
const mockedDispatch = Store.dispatch as jest.Mock;

const makeState = ({ currentTime = 0, BPM = 120, regionList = [] as any[], trackList = [{ index: 0 }] } = {}) => ({
    webAudio: {
        context: { currentTime, state: 'running', resume: jest.fn() },
        sound: { play: jest.fn(), scheduleStop: jest.fn(), stopAll: jest.fn() },
    },
    tracks: { trackList },
    control: { BPM },
    composition: { regionList },
});

describe('Sequencer', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('advenceNote', () => {
        it('advances noteTime by a sixteenth note length derived from BPM', () => {
            // 120 BPM -> 0.5 s per beat -> 0.125 s per sixteenth
            mockedGetState.mockReturnValue(makeState({ BPM: 120 }));
            const sequencer = new Sequencer();
            sequencer.noteTime = 0;

            sequencer.advenceNote();

            expect(sequencer.noteTime).toBeCloseTo(0.125);
            expect(sequencer.sixteenthPlaying).toBe(1);
        });

        it('scales with tempo', () => {
            // 60 BPM -> 1 s per beat -> 0.25 s per sixteenth
            mockedGetState.mockReturnValue(makeState({ BPM: 60 }));
            const sequencer = new Sequencer();
            sequencer.noteTime = 0;

            sequencer.advenceNote();

            expect(sequencer.noteTime).toBeCloseTo(0.25);
        });

        it('dispatches the updated playhead position', () => {
            mockedGetState.mockReturnValue(makeState());
            const sequencer = new Sequencer();
            sequencer.noteTime = 0;

            sequencer.advenceNote();

            expect(updateCurrentTime).toHaveBeenCalledWith(1);
            expect(mockedDispatch).toHaveBeenCalledWith({ type: 'UPDATE_CURRENT_TIME', payload: 1 });
        });
    });

    describe('schedule', () => {
        it('schedules all sixteenths within the lookahead window', () => {
            // currentTime 0, lookahead 0.2 s, 0.125 s per sixteenth at 120 BPM:
            // sixteenths 0 (noteTime 0) and 1 (noteTime 0.125) fit; 0.25 does not.
            const state = makeState({ BPM: 120 });
            mockedGetState.mockReturnValue(state);
            const sequencer = new Sequencer();
            sequencer.startTime = 0;
            sequencer.noteTime = 0;

            sequencer.schedule();

            expect(state.webAudio.sound.scheduleStop).toHaveBeenCalledTimes(2);
            expect(state.webAudio.sound.scheduleStop).toHaveBeenNthCalledWith(1, 0, 0, SoundOrigin.composition);
            expect(state.webAudio.sound.scheduleStop).toHaveBeenNthCalledWith(2, 1, 0.125, SoundOrigin.composition);
            expect(sequencer.sixteenthPlaying).toBe(2);
        });

        it('plays region notes at their scheduled context time with MIDI note numbers', () => {
            const regionList = [
                {
                    id: 1,
                    trackIndex: 0,
                    start: 0,
                    end: 1,
                    regionLength: 1,
                    // note row 48 (A4 = MIDI 69) starts at sixteenth 1, lasts 2 sixteenths
                    notes: Object.assign([], { 48: [{ sixteenthNumber: 1, length: 2 }] }),
                },
            ];
            const state = makeState({ BPM: 120, regionList, currentTime: 10 });
            mockedGetState.mockReturnValue(state);
            const sequencer = new Sequencer();
            sequencer.startTime = 10;
            sequencer.noteTime = 0;

            sequencer.schedule();

            expect(state.webAudio.sound.play).toHaveBeenCalledTimes(1);
            expect(state.webAudio.sound.play).toHaveBeenCalledWith(
                0, // track index
                10.125, // startTime + noteTime of sixteenth 1
                69, // noteToMIDI(48)
                SoundOrigin.composition,
                3, // sixteenthPlaying (1) + duration (2)
            );
        });

        it('plays nothing when no track has notes in the window', () => {
            const state = makeState();
            mockedGetState.mockReturnValue(state);
            const sequencer = new Sequencer();
            sequencer.startTime = 0;
            sequencer.noteTime = 0;

            sequencer.schedule();

            expect(state.webAudio.sound.play).not.toHaveBeenCalled();
        });
    });

    describe('handleStop', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('stops the timer worker, then stops all composition sounds and resets the playhead', () => {
            const state = makeState();
            mockedGetState.mockReturnValue(state);
            const sequencer = new Sequencer();
            sequencer.timerWorker = { postMessage: jest.fn() } as any;
            sequencer.sixteenthPlaying = 12;

            sequencer.handleStop();

            expect(sequencer.timerWorker!.postMessage).toHaveBeenCalledWith('stop');
            expect(state.webAudio.sound.stopAll).not.toHaveBeenCalled();

            jest.runAllTimers();

            expect(state.webAudio.sound.stopAll).toHaveBeenCalledWith(SoundOrigin.composition);
            expect(sequencer.sixteenthPlaying).toBe(0);
            expect(updateCurrentTime).toHaveBeenCalledWith(0);
        });
    });

    describe('handlePause', () => {
        it('stops the timer worker and all composition sounds immediately', () => {
            const state = makeState();
            mockedGetState.mockReturnValue(state);
            const sequencer = new Sequencer();
            sequencer.timerWorker = { postMessage: jest.fn() } as any;

            sequencer.handlePause();

            expect(sequencer.timerWorker!.postMessage).toHaveBeenCalledWith('stop');
            expect(state.webAudio.sound.stopAll).toHaveBeenCalledWith(SoundOrigin.composition);
        });
    });
});
