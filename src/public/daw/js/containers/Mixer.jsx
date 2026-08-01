import * as React from 'react';
import { connect } from 'react-redux';
import { isNullOrUndefined, volumeToDb, normalizePan, panLabel } from 'engine/Utils';
import { readAccent } from 'engine/Theme';
import {
    changeTrackVolume,
    changeTrackPan,
    changeSoloState,
    changeMuteState,
    changeRecordState,
} from 'actions/trackListActions';

/**
 * Stage 10 — Mixer (mix view). One strip per track + master, each with a live
 * 2-bar meter (rAF off the track's analyser), vertical fader, pan, dB and S/M/R.
 * All controls dispatch the real track actions. Shown when composition.showMixer
 * (toggled from the Footer); CompositionGrid renders <Mixer/> in place of the
 * arrange/timeline view.
 */
class MixerMeter extends React.Component {
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
        const tn = this.props.trackNode;
        const v = tn && tn.getAverageVolume ? tn.getAverageVolume() : { left: 0, right: 0 };
        ctx.fillStyle = readAccent();
        const lh = Math.min(h, (v.left / 140) * h);
        const rh = Math.min(h, (v.right / 140) * h);
        ctx.fillRect(0, h - lh, w / 2 - 1, lh);
        ctx.fillRect(w / 2 + 1, h - rh, w / 2 - 1, rh);
        this.raf = requestAnimationFrame(this.draw.bind(this));
    }
    render() {
        return (
            <canvas
                className="pq-mix-meter"
                width={16}
                height={150}
                ref={(input) => {
                    this.initCanvas(input);
                }}
            ></canvas>
        );
    }
}

class Mixer extends React.Component {
    strip(track, isMaster) {
        const index = track.index;
        const vol = track.volume;
        const db = volumeToDb(vol);
        const pan = Math.round(normalizePan(track.pan));
        const panText = panLabel(track.pan);
        return (
            <div className={'pq-mix-strip' + (isMaster ? ' is-master' : '')} key={index}>
                <div className="pq-mix-name" title={track.name}>
                    {track.name}
                </div>
                <div className="pq-mix-fader-row">
                    <MixerMeter trackNode={track.trackNode} />
                    <input
                        className="pq-mix-fader"
                        type="range"
                        min="0"
                        max="200"
                        orient="vertical"
                        value={Math.round(vol * 100)}
                        onChange={(e) =>
                            this.props.dispatch(changeTrackVolume(index, parseInt(e.target.value) / 100 || 0.0001))
                        }
                    />
                </div>
                <div className="pq-mix-db">{db} dB</div>
                <div className="pq-mix-pan-row">
                    <span className="pq-mix-pan-val">{panText}</span>
                    <input
                        className="pq-mix-pan"
                        type="range"
                        min="-100"
                        max="100"
                        value={pan}
                        onChange={(e) =>
                            this.props.dispatch(changeTrackPan(index, Number(e.target.value) || 0.0000001))
                        }
                    />
                </div>
                {!isMaster && (
                    <div className="pq-mix-smr">
                        <button
                            className={'pq-mix-btn solo' + (track.solo ? ' is-active' : '')}
                            onClick={() => this.props.dispatch(changeSoloState(index))}
                        >
                            S
                        </button>
                        <button
                            className={'pq-mix-btn mute' + (track.mute ? ' is-active' : '')}
                            onClick={() => this.props.dispatch(changeMuteState(index))}
                        >
                            M
                        </button>
                        <button
                            className={'pq-mix-btn rec' + (track.record ? ' is-active' : '')}
                            onClick={() => this.props.dispatch(changeRecordState(index))}
                        >
                            R
                        </button>
                    </div>
                )}
            </div>
        );
    }

    render() {
        // Bottom-docked overlay panel (like the keyboard) — hidden unless toggled.
        if (!this.props.showMixer) {
            return null;
        }
        const strips = [];
        for (let i = 1; i < this.props.trackList.length; i++) {
            strips.push(this.strip(this.props.trackList[i], false));
        }
        strips.sort((a, b) => a.key - b.key);
        const master = this.props.trackList.find((t) => t.index === 0);
        return (
            <div className="pq-mixer">
                <div className="pq-mixer-strips">
                    {strips}
                    {master && this.strip(master, true)}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    trackList: state.tracks.trackList,
    showMixer: state.composition.showMixer,
});

export default connect(mapStateToProps)(Mixer);
