import Store from '../stroe';
import Sound from './Sound';
import { SoundOrigin } from '../constants/Constants';

jest.mock('../stroe', () => ({
    __esModule: true,
    default: {
        getState: jest.fn(),
        dispatch: jest.fn(),
    },
}));

const mockedGetState = Store.getState as jest.Mock;

const makeContext = (state = 'running') =>
    ({
        state,
        currentTime: 1.0,
        resume: jest.fn(),
    } as any);

const makeTrack = (index: number) => ({
    index,
    instrument: {
        noteOn: jest.fn(),
        noteOff: jest.fn(),
    },
});

describe('Sound', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('resumes a suspended context', () => {
            const context = makeContext('suspended');
            new Sound(context);
            expect(context.resume).toHaveBeenCalled();
        });

        it('does not resume a running context', () => {
            const context = makeContext('running');
            new Sound(context);
            expect(context.resume).not.toHaveBeenCalled();
        });
    });

    describe('play', () => {
        it('calls noteOn on the track instrument with the given play time', () => {
            const track = makeTrack(0);
            mockedGetState.mockReturnValue({ tracks: { trackList: [track] } });
            const sound = new Sound(makeContext());

            sound.play(0, 2.5, 69, SoundOrigin.keyboard, undefined);

            expect(track.instrument.noteOn).toHaveBeenCalledWith(69, 2.5);
        });

        it('defaults the play time to context.currentTime + 0.001 when not given', () => {
            const track = makeTrack(0);
            mockedGetState.mockReturnValue({ tracks: { trackList: [track] } });
            const sound = new Sound(makeContext());

            sound.play(0, null, 60, SoundOrigin.keyboard, undefined);

            expect(track.instrument.noteOn).toHaveBeenCalledWith(60, 1.001);
        });

        it('registers composition-origin notes in playingSounds for scheduled stop', () => {
            const track = makeTrack(0);
            mockedGetState.mockReturnValue({ tracks: { trackList: [track] } });
            const sound = new Sound(makeContext());

            sound.play(0, 2.5, 69, SoundOrigin.composition, 8);

            expect(sound.playingSounds[SoundOrigin.composition]).toEqual([
                { trackIndex: 0, note: 69, origin: SoundOrigin.composition, endIndex: 8 },
            ]);
        });

        it('does not register keyboard-origin notes in playingSounds', () => {
            const track = makeTrack(0);
            mockedGetState.mockReturnValue({ tracks: { trackList: [track] } });
            const sound = new Sound(makeContext());

            sound.play(0, 2.5, 69, SoundOrigin.keyboard, undefined);

            expect(sound.playingSounds[SoundOrigin.keyboard]).toEqual([]);
        });
    });

    describe('stop', () => {
        it('calls noteOff on the track instrument with the given stop time', () => {
            const track = makeTrack(1);
            mockedGetState.mockReturnValue({ tracks: { trackList: [track] } });
            const sound = new Sound(makeContext());

            sound.stop(1, 69, 3.0);

            expect(track.instrument.noteOff).toHaveBeenCalledWith(69, 3.0);
        });

        it('defaults the stop time to context.currentTime + 0.001 when not given', () => {
            const track = makeTrack(1);
            mockedGetState.mockReturnValue({ tracks: { trackList: [track] } });
            const sound = new Sound(makeContext());

            sound.stop(1, 69);

            expect(track.instrument.noteOff).toHaveBeenCalledWith(69, 1.001);
        });
    });

    describe('scheduleStop', () => {
        it('stops and removes only notes whose endIndex matches the playing sixteenth', () => {
            const track = makeTrack(0);
            mockedGetState.mockReturnValue({ tracks: { trackList: [track] } });
            const sound = new Sound(makeContext());
            sound.playingSounds[SoundOrigin.composition] = [
                { trackIndex: 0, note: 60, origin: SoundOrigin.composition, endIndex: 4 },
                { trackIndex: 0, note: 62, origin: SoundOrigin.composition, endIndex: 8 },
                { trackIndex: 0, note: 64, origin: SoundOrigin.composition, endIndex: 4 },
            ];

            sound.scheduleStop(4, 2.0, SoundOrigin.composition);

            expect(track.instrument.noteOff).toHaveBeenCalledTimes(2);
            expect(track.instrument.noteOff).toHaveBeenCalledWith(64, 2.0);
            expect(track.instrument.noteOff).toHaveBeenCalledWith(60, 2.0);
            expect(sound.playingSounds[SoundOrigin.composition]).toEqual([
                { trackIndex: 0, note: 62, origin: SoundOrigin.composition, endIndex: 8 },
            ]);
        });
    });

    describe('stopAll', () => {
        it('stops every note of the given origin and clears the list', () => {
            const track = makeTrack(0);
            mockedGetState.mockReturnValue({ tracks: { trackList: [track] } });
            const sound = new Sound(makeContext());
            sound.playingSounds[SoundOrigin.composition] = [
                { trackIndex: 0, note: 60, origin: SoundOrigin.composition, endIndex: 4 },
                { trackIndex: 0, note: 62, origin: SoundOrigin.composition, endIndex: 8 },
            ];

            sound.stopAll(SoundOrigin.composition);

            expect(track.instrument.noteOff).toHaveBeenCalledTimes(2);
            expect(sound.playingSounds[SoundOrigin.composition]).toEqual([]);
        });
    });
});
