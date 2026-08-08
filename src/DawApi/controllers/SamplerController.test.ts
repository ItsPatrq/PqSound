import * as path from 'path';
import { getInstrument } from './SamplerController';

/**
 * The sampler route is the app's only file-serving endpoint, so its two
 * behaviours both matter: legitimate sample paths must resolve, and anything
 * escaping the instruments directory must not. The containment guard rejected
 * *everything* until the base path stopped carrying a trailing separator.
 */
const mockRes = () => {
    const res: any = {};
    res.writeHead = jest.fn().mockReturnValue(res);
    res.end = jest.fn().mockReturnValue(res);
    return res;
};

const request = (splat: string | string[]) => ({ params: { splat } }) as any;

describe('SamplerController.getInstrument', () => {
    it('serves a sample from a known instrument directory', (done) => {
        const res = mockRes();
        res.end.mockImplementation(() => {
            // 200 + audio/wav means the containment guard let it through and the
            // file was read.
            expect(res.writeHead).toHaveBeenCalledWith(200, expect.objectContaining({ 'Content-Type': 'audio/wav' }));
            done();
            return res;
        });

        getInstrument(request(['DSKGrandPiano', 'DSK_Grand_A0.wav']), res);
    });

    it('accepts the wildcard as a joined string too', (done) => {
        const res = mockRes();
        res.end.mockImplementation(() => {
            expect(res.writeHead).toHaveBeenCalledWith(200, expect.anything());
            done();
            return res;
        });

        getInstrument(request('DSKGrandPiano/DSK_Grand_A0.wav'), res);
    });

    it('404s an unknown instrument', () => {
        const res = mockRes();

        getInstrument(request('NotAnInstrument/x.wav'), res);

        expect(res.writeHead).toHaveBeenCalledWith(404, expect.anything());
    });

    it('403s a path escaping the instruments directory', () => {
        const res = mockRes();

        getInstrument(request('DSKGrandPiano/../../../package.json'), res);

        expect(res.writeHead).toHaveBeenCalledWith(403, expect.anything());
    });

    it('404s a missing file inside a known instrument', (done) => {
        const res = mockRes();
        res.end.mockImplementation(() => {
            expect(res.writeHead).toHaveBeenCalledWith(404, expect.anything());
            done();
            return res;
        });

        getInstrument(request(['DSKGrandPiano', 'does-not-exist.wav']), res);
    });

    it('does not treat the instruments directory itself as a sample', () => {
        const res = mockRes();

        getInstrument(request(''), res);

        expect(res.writeHead).toHaveBeenCalledWith(404, expect.anything());
    });
});

// Guards the assumption the tests above rest on.
it('has the sample fixture the serving tests read', () => {
    const fixture = path.resolve(__dirname, '../../../assets/audio/samples/instruments/DSKGrandPiano/DSK_Grand_A0.wav');
    expect(require('fs').existsSync(fixture)).toBe(true);
});
