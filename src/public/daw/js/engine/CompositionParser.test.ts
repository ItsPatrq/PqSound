import Store from '../stroe';
import * as CompositionParser from './CompositionParser';

jest.mock('../stroe', () => ({
    __esModule: true,
    default: {
        getState: jest.fn(),
        dispatch: jest.fn(),
    },
}));

const mockedGetState = Store.getState as jest.Mock;

/**
 * Region helper. `notes` is indexed by note number; each entry is a list of
 * { sixteenthNumber, length } within the region.
 */
const makeRegion = (overrides = {}) => ({
    id: 1,
    trackIndex: 0,
    start: 0,
    end: 1,
    regionLength: 1,
    notes: [],
    ...overrides,
});

const setState = (state) => mockedGetState.mockReturnValue(state);

describe('CompositionParser', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getRegionsByTrackIndex', () => {
        it('filters regions by track index from an explicit list', () => {
            const regions = [
                makeRegion({ id: 1, trackIndex: 0 }),
                makeRegion({ id: 2, trackIndex: 1 }),
                makeRegion({ id: 3, trackIndex: 0 }),
            ];
            const result = CompositionParser.getRegionsByTrackIndex(0, regions as any);
            expect(result.map((r) => r.id)).toEqual([1, 3]);
        });

        it('falls back to the store region list when none is given', () => {
            setState({ composition: { regionList: [makeRegion({ id: 5, trackIndex: 2 })] } });
            const result = CompositionParser.getRegionsByTrackIndex(2);
            expect(result.map((r) => r.id)).toEqual([5]);
        });
    });

    describe('regionToDrawParser', () => {
        it('marks region bits with 1 (start), 2 (middle), 3 (end)', () => {
            setState({
                composition: { regionList: [makeRegion({ id: 1, start: 1, end: 3 })] },
            });
            expect(CompositionParser.regionToDrawParser(0, 6, -1)).toEqual([0, 1, 2, 3, 0, 0]);
        });

        it('marks the copied region with 4/5/6 instead', () => {
            setState({
                composition: { regionList: [makeRegion({ id: 7, start: 0, end: 2 })] },
            });
            expect(CompositionParser.regionToDrawParser(0, 4, 7)).toEqual([4, 5, 6, 0]);
        });
    });

    describe('getRegionIdByBitIndex', () => {
        beforeEach(() => {
            setState({
                composition: {
                    regionList: [makeRegion({ id: 10, start: 2, end: 4 })],
                },
            });
        });

        it('returns the region id when the bit falls inside a region (bounds inclusive)', () => {
            expect(CompositionParser.getRegionIdByBitIndex(0, 2)).toBe(10);
            expect(CompositionParser.getRegionIdByBitIndex(0, 3)).toBe(10);
            expect(CompositionParser.getRegionIdByBitIndex(0, 4)).toBe(10);
        });

        it('returns null when the bit is outside every region', () => {
            expect(CompositionParser.getRegionIdByBitIndex(0, 5)).toBeNull();
        });
    });

    describe('getRegionByRegionId', () => {
        it('returns the matching region from an explicit list', () => {
            const region = makeRegion({ id: 3 });
            expect(CompositionParser.getRegionByRegionId(3, [region] as any)).toBe(region as any);
        });

        it('returns null when no region matches', () => {
            expect(CompositionParser.getRegionByRegionId(99, [] as any)).toBeNull();
        });
    });

    describe('notesToDrawParser', () => {
        it('returns null when the piano roll region does not exist', () => {
            setState({ composition: { regionList: [], pianoRollRegion: 42 } });
            expect(CompositionParser.notesToDrawParser(0)).toBeNull();
        });

        it('marks note sixteenths with 1 (start), 2 (middle), 3 (end)', () => {
            const notes: any[] = [];
            notes[5] = [{ sixteenthNumber: 2, length: 3 }];
            setState({
                composition: {
                    regionList: [makeRegion({ id: 1, regionLength: 1, notes })],
                    pianoRollRegion: 1,
                },
            });
            const result = CompositionParser.notesToDrawParser(5)!;
            expect(result).toHaveLength(16);
            expect(result.slice(0, 6)).toEqual([0, 0, 1, 2, 3, 0]);
        });

        it('returns all zeros when the note row is empty', () => {
            setState({
                composition: {
                    regionList: [makeRegion({ id: 1, regionLength: 1, notes: [] })],
                    pianoRollRegion: 1,
                },
            });
            expect(CompositionParser.notesToDrawParser(0)).toEqual(new Array(16).fill(0));
        });
    });

    describe('notesToPlay', () => {
        it('returns notes starting exactly at the given sixteenth', () => {
            const notes: any[] = [];
            notes[4] = [
                { sixteenthNumber: 2, length: 2 },
                { sixteenthNumber: 5, length: 1 },
            ];
            setState({
                composition: { regionList: [makeRegion({ notes })] },
            });
            expect(CompositionParser.notesToPlay(2, 0)).toEqual([{ note: 4, duration: 2 }]);
        });

        it('offsets note positions by the region start (in bars of 16 sixteenths)', () => {
            const notes: any[] = [];
            notes[0] = [{ sixteenthNumber: 0, length: 1 }];
            setState({
                composition: { regionList: [makeRegion({ start: 2, end: 3, notes })] },
            });
            expect(CompositionParser.notesToPlay(32, 0)).toEqual([{ note: 0, duration: 1 }]);
            expect(CompositionParser.notesToPlay(0, 0)).toEqual([]);
        });

        it('skips empty note rows and other tracks', () => {
            const notes: any[] = [];
            notes[1] = [];
            notes[2] = [{ sixteenthNumber: 0, length: 1 }];
            setState({
                composition: {
                    regionList: [
                        makeRegion({ trackIndex: 0, notes }),
                        makeRegion({ trackIndex: 1, notes: [[{ sixteenthNumber: 0, length: 1 }]] }),
                    ],
                },
            });
            expect(CompositionParser.notesToPlay(0, 0)).toEqual([{ note: 2, duration: 1 }]);
        });
    });
});
