/**
 * @jest-environment jsdom
 */
import reducer, {
    switchKeyboardVisibility,
    updateWidth,
    changeFirstKeyboardKey,
    addPlayingNote,
    removePlayingNote,
    changeKeyBindings,
    switchKeyNameVisibility,
    switchKeyBindVisibility,
} from 'slices/keyboardSlice';

/**
 * The slice runs through Immer now (#156 follow-up), so these check both the
 * behaviour and that the previous state is left alone — the property the
 * store's immutableCheck enforces.
 */
describe('keyboardSlice', () => {
    const initial = () => reducer(undefined, { type: '@@INIT' }) as any;

    it('starts hidden, on C3, with no notes held', () => {
        const state = initial();

        expect(state.show).toBe(false);
        expect(state.firstKey).toBe(27);
        expect(state.notesPlaying).toEqual([]);
    });

    describe('switchKeyboardVisibility', () => {
        // The app calls these with no argument; TS wants the `void` payload spelled out.
        it('toggles when given no payload', () => {
            expect((reducer(initial(), switchKeyboardVisibility(undefined)) as any).show).toBe(true);
        });

        it('sets explicitly when given one', () => {
            const shown = reducer(initial(), switchKeyboardVisibility(true)) as any;

            expect((reducer(shown, switchKeyboardVisibility(true)) as any).show).toBe(true);
            expect((reducer(shown, switchKeyboardVisibility(false)) as any).show).toBe(false);
        });
    });

    describe('playing notes', () => {
        it('adds without mutating the previous state', () => {
            const before = initial();

            const after = reducer(before, addPlayingNote(60)) as any;

            expect(after.notesPlaying).toEqual([60]);
            expect(before.notesPlaying).toEqual([]);
        });

        it('removes only the first occurrence — a note can be held from the keyboard and MIDI at once', () => {
            let state = initial();
            state = reducer(state, addPlayingNote(60));
            state = reducer(state, addPlayingNote(64));
            state = reducer(state, addPlayingNote(60));

            const after = reducer(state, removePlayingNote(60)) as any;

            expect(after.notesPlaying).toEqual([64, 60]);
        });

        it('ignores a note that is not held', () => {
            const state = reducer(initial(), addPlayingNote(60));

            expect((reducer(state, removePlayingNote(72)) as any).notesPlaying).toEqual([60]);
        });
    });

    describe('changeKeyBindings', () => {
        it('offsets every binding and leaves the previous ones untouched', () => {
            const before = initial();
            const firstBefore = before.keyBindings[0].MIDINote;

            const after = reducer(before, changeKeyBindings(12)) as any;

            expect(after.keyBindings[0].MIDINote).toBe(firstBefore + 12);
            expect(before.keyBindings[0].MIDINote).toBe(firstBefore);
        });
    });

    it('stores width and first key', () => {
        expect((reducer(initial(), updateWidth(320)) as any).width).toBe(320);
        expect((reducer(initial(), changeFirstKeyboardKey(39)) as any).firstKey).toBe(39);
    });

    it('toggles the key-name and key-bind overlays', () => {
        expect((reducer(initial(), switchKeyNameVisibility(undefined)) as any).keyNamesVisible).toBe(false);
        expect((reducer(initial(), switchKeyBindVisibility(undefined)) as any).keyBindVisible).toBe(false);
    });
});
