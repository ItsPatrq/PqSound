/**
 * @jest-environment jsdom
 */
import reducer, {
    switchPlayState,
    changeBPM,
    changeTool,
    updateCurrentTime,
    setCurrentTime,
    updateMidiState,
    loadControlState,
    copyRegion,
    textInputFocusedSwitch,
} from 'reducers/controlReducer';
import { tools } from 'constants/Constants';

describe('controlReducer', () => {
    const initial = () => reducer(undefined, { type: '@@INIT' }) as any;

    it('starts stopped at 120 BPM with the draw tool', () => {
        const state = initial();

        expect(state.playing).toBe(false);
        expect(state.BPM).toBe(120);
        expect(state.tool).toBe(tools.draw.id);
        expect(state.midi).toEqual({ supported: false, inputs: [], selectedInputId: null });
    });

    it('toggles the transport and stores tempo and tool', () => {
        expect((reducer(initial(), switchPlayState(undefined)) as any).playing).toBe(true);
        expect((reducer(initial(), changeBPM(90)) as any).BPM).toBe(90);
        expect((reducer(initial(), changeTool(tools.remove.id)) as any).tool).toBe(tools.remove.id);
    });

    describe('playhead', () => {
        it('is written by both the scheduler report and an explicit move', () => {
            // updateCurrentTime comes from the Sequencer; setCurrentTime is what
            // the changeCurrentTime thunk dispatches after moving the cursor.
            expect((reducer(initial(), updateCurrentTime(12)) as any).sixteenthNotePlaying).toBe(12);
            expect((reducer(initial(), setCurrentTime(48)) as any).sixteenthNotePlaying).toBe(48);
        });
    });

    describe('updateMidiState', () => {
        it('stores the serializable snapshot the engine reports', () => {
            const snapshot = { supported: true, inputs: [{ id: 'a', name: 'Launchkey' }], selectedInputId: 'a' };

            const state = reducer(initial(), updateMidiState(snapshot)) as any;

            expect(state.midi).toEqual(snapshot);
        });
    });

    describe('loadControlState', () => {
        it('merges the loaded fields over the defaults', () => {
            const state = reducer(initial(), loadControlState({ BPM: 140, tool: tools.select.id })) as any;

            expect(state.BPM).toBe(140);
            expect(state.tool).toBe(tools.select.id);
            // Untouched defaults survive the merge.
            expect(state.maxBPM).toBe(300);
        });
    });

    it('remembers the copied region and the text-input guard', () => {
        expect((reducer(initial(), copyRegion(7)) as any).copiedRegion).toBe(7);
        expect((reducer(initial(), textInputFocusedSwitch(undefined)) as any).textInputFocused).toBe(true);
    });
});
