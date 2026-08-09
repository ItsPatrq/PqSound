/**
 * @jest-environment jsdom
 */
import reducer, { instrumentModalVisibilitySwitch, pluginModalVisibilitySwitch } from 'slices/trackDetailsSlice';

describe('trackDetailsSlice', () => {
    const initial = () => reducer(undefined, { type: '@@INIT' }) as any;

    it('starts with both editor columns closed', () => {
        const state = initial();

        expect(state.showInstrumentModal).toBe(false);
        expect(state.showPluginModal).toBe(false);
        expect(state.selectedPluginIndex).toBeNull();
    });

    describe('instrumentModalVisibilitySwitch', () => {
        it('toggles with no payload', () => {
            expect((reducer(initial(), instrumentModalVisibilitySwitch(undefined)) as any).showInstrumentModal).toBe(
                true,
            );
        });

        it('sets explicitly with one, so the two callers cannot desync it', () => {
            const open = reducer(initial(), instrumentModalVisibilitySwitch(true)) as any;

            expect((reducer(open, instrumentModalVisibilitySwitch(true)) as any).showInstrumentModal).toBe(true);
            expect((reducer(open, instrumentModalVisibilitySwitch(false)) as any).showInstrumentModal).toBe(false);
        });
    });

    describe('pluginModalVisibilitySwitch', () => {
        it('keeps the two-argument call signature and records the selection', () => {
            const state = reducer(initial(), pluginModalVisibilitySwitch(2, 1)) as any;

            expect(state.showPluginModal).toBe(true);
            expect(state.selectedPluginIndex).toBe(2);
            expect(state.selectedPluginTrackIndex).toBe(1);
        });

        it('toggles the panel shut on a second call', () => {
            const open = reducer(initial(), pluginModalVisibilitySwitch(0, 1));

            expect((reducer(open, pluginModalVisibilitySwitch(0, 1)) as any).showPluginModal).toBe(false);
        });
    });
});
