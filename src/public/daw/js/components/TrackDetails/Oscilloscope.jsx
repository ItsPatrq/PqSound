import * as React from 'react';
import { isNullOrUndefined } from 'engine/Utils';
import { readAccent } from 'engine/Theme';

/**
 * Channel-panel oscilloscope. Draws a live time-domain waveform from the
 * selected track's left analyser (Track.leftAnalyserNode, fftSize 1024) via
 * requestAnimationFrame. When there's no signal the analyser returns a flat
 * mid-line (128), so an idle track renders as a centred horizontal line.
 */
class Oscilloscope extends React.Component {
    componentWillUnmount() {
        if (this.raf) {
            cancelAnimationFrame(this.raf);
        }
    }

    initCanvas(input) {
        if (!isNullOrUndefined(input) && isNullOrUndefined(this.ctx)) {
            this.canvas = input;
            this.ctx = input.getContext('2d');
            this.draw();
        }
    }

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        ctx.clearRect(0, 0, w, h);

        const trackNode = this.props.trackNode;
        const analyser = trackNode && trackNode.leftAnalyserNode;
        if (analyser) {
            const bins = analyser.fftSize;
            const data = new Uint8Array(bins);
            analyser.getByteTimeDomainData(data);
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = readAccent();
            ctx.beginPath();
            const slice = w / bins;
            for (let i = 0; i < bins; i++) {
                const v = data[i] / 128.0; // 1.0 = silence mid-line
                const y = (v * h) / 2;
                const x = i * slice;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        }
        this.raf = requestAnimationFrame(this.draw.bind(this));
    }

    render() {
        return (
            <canvas
                className="pq-scope-canvas"
                width={272}
                height={84}
                ref={(input) => {
                    this.initCanvas(input);
                }}
            ></canvas>
        );
    }
}

export default Oscilloscope;
