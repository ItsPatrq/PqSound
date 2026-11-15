/** Minimal RIFF/WAVE reader and writer: PCM 16/24/32-bit and IEEE float 32. */

export interface Audio {
    sampleRate: number;
    channels: Float32Array[];
}

export function readWav(buf: Uint8Array): Audio {
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    const tag = (o: number) => String.fromCharCode(buf[o], buf[o + 1], buf[o + 2], buf[o + 3]);
    if (tag(0) !== 'RIFF' || tag(8) !== 'WAVE') throw new Error('Not a WAVE file');
    let format = 0;
    let channels = 0;
    let sampleRate = 0;
    let bits = 0;
    let offset = 12;
    while (offset + 8 <= buf.length) {
        const id = tag(offset);
        const size = view.getUint32(offset + 4, true);
        const body = offset + 8;
        if (id === 'fmt ') {
            format = view.getUint16(body, true);
            channels = view.getUint16(body + 2, true);
            sampleRate = view.getUint32(body + 4, true);
            bits = view.getUint16(body + 14, true);
            if (format === 0xfffe) format = view.getUint16(body + 24, true); // WAVE_FORMAT_EXTENSIBLE
        } else if (id === 'data') {
            const bytesPerSample = bits / 8;
            const frames = Math.floor(size / (bytesPerSample * channels));
            const out = Array.from({ length: channels }, () => new Float32Array(frames));
            for (let f = 0; f < frames; f++) {
                for (let c = 0; c < channels; c++) {
                    const p = body + (f * channels + c) * bytesPerSample;
                    let v: number;
                    if (format === 3 && bits === 32) v = view.getFloat32(p, true);
                    else if (bits === 16) v = view.getInt16(p, true) / 32768;
                    else if (bits === 24) {
                        const raw = buf[p] | (buf[p + 1] << 8) | (buf[p + 2] << 16);
                        v = ((raw << 8) >> 8) / 8388608;
                    } else if (bits === 32) v = view.getInt32(p, true) / 2147483648;
                    else throw new Error(`Unsupported WAV sample format: ${format}/${bits}`);
                    out[c][f] = v;
                }
            }
            return { sampleRate, channels: out };
        }
        offset = body + size + (size & 1);
    }
    throw new Error('WAVE file has no data chunk');
}

/** 16-bit PCM. */
export function writeWav(audio: Audio): Uint8Array {
    const ch = audio.channels.length;
    const frames = audio.channels[0].length;
    const dataSize = frames * ch * 2;
    const buf = new Uint8Array(44 + dataSize);
    const view = new DataView(buf.buffer);
    const str = (o: number, s: string) => [...s].forEach((c, i) => (buf[o + i] = c.charCodeAt(0)));
    str(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    str(8, 'WAVE');
    str(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, ch, true);
    view.setUint32(24, audio.sampleRate, true);
    view.setUint32(28, audio.sampleRate * ch * 2, true);
    view.setUint16(32, ch * 2, true);
    view.setUint16(34, 16, true);
    str(36, 'data');
    view.setUint32(40, dataSize, true);
    for (let f = 0; f < frames; f++) {
        for (let c = 0; c < ch; c++) {
            const v = Math.max(-1, Math.min(1, audio.channels[c][f]));
            view.setInt16(44 + (f * ch + c) * 2, Math.round(v * 32767), true);
        }
    }
    return buf;
}
