import * as React from 'react';
import { connect } from 'react-redux';
import Store from '../store';
import { switchPianorollVisibility, switchMixerVisibility } from 'reducers/compositionReducer';
import * as Utils from 'engine/Utils';
import AudioEngine from 'engine/AudioEngine';

const C = {
    control: '#191d21',
    accent: 'var(--pq-accent)',
    faint: '#5d656b',
};

// Bottom view bar (design): left = Piano Roll / Mixer view toggles, right = master
// OUT meter. Sits as its own grid row directly above the status footer. The two
// view toggles are mutually exclusive with each other (opening one closes the
// other); "off" for both = the arrange/composition view.
class ViewBar extends React.Component {
    constructor() {
        super();
        // Master OUT meter (moved here from the header per the design). rAF-driven,
        // writes bar-fill heights via refs — no per-frame React re-render.
        this.outFillRefs = [null, null];
        this.meterRAF = null;
    }

    componentDidMount() {
        this.meterRAF = requestAnimationFrame(() => this.tickMeter());
    }
    componentWillUnmount() {
        if (this.meterRAF) cancelAnimationFrame(this.meterRAF);
    }

    tickMeter() {
        const master = Store.getState().tracks.trackList[0];
        const node = master && AudioEngine.getTrackNode(master.id);
        let left = 0;
        let right = 0;
        if (node && typeof node.getAverageVolume === 'function') {
            const v = node.getAverageVolume();
            left = v.left;
            right = v.right;
        }
        const toPct = (x) => Math.max(6, Math.min(100, (x / 140) * 100));
        if (this.outFillRefs[0]) this.outFillRefs[0].style.height = toPct(left) + '%';
        if (this.outFillRefs[1]) this.outFillRefs[1].style.height = toPct(right) + '%';
        this.meterRAF = requestAnimationFrame(() => this.tickMeter());
    }

    // Piano roll needs a region (set by clicking one in the arrange view); the
    // reducer guards SWITCH_PIANO_ROLL_VISIBILITY to false when none is set.
    pianoRollEnabled() {
        return !Utils.isNullUndefinedOrEmpty(this.props.pianoRollRegion);
    }

    togglePianoRoll() {
        if (!this.pianoRollEnabled()) return;
        const willShow = !this.props.showPianoRoll;
        this.props.dispatch(switchPianorollVisibility());
        if (willShow && this.props.showMixer) {
            this.props.dispatch(switchMixerVisibility(false));
        }
    }

    toggleMixer() {
        const willShow = !this.props.showMixer;
        this.props.dispatch(switchMixerVisibility());
        if (willShow && this.props.showPianoRoll) {
            this.props.dispatch(switchPianorollVisibility(false));
        }
    }

    render() {
        const prEnabled = this.pianoRollEnabled();
        return (
            <div className="pq-viewbar">
                <div className="pq-viewbar-views">
                    <button
                        className={'pq-btn pq-viewbar-btn' + (this.props.showPianoRoll ? ' is-active' : '')}
                        onClick={() => this.togglePianoRoll()}
                        disabled={!prEnabled}
                        title={prEnabled ? 'Piano roll editor' : 'Open a region to edit in the piano roll'}
                    >
                        Piano Roll
                    </button>
                    <button
                        className={'pq-btn pq-viewbar-btn' + (this.props.showMixer ? ' is-active' : '')}
                        onClick={() => this.toggleMixer()}
                        title="Mixer"
                    >
                        Mixer
                    </button>
                </div>

                <div className="pq-viewbar-out">
                    <span className="pq-mono pq-viewbar-out-label">OUT</span>
                    <div className="pq-viewbar-out-meter">
                        {[0, 1].map((i) => (
                            <div key={i} className="pq-viewbar-out-bar">
                                <div
                                    ref={(el) => (this.outFillRefs[i] = el)}
                                    className="pq-viewbar-out-fill"
                                    style={{ background: C.accent }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    showPianoRoll: state.composition.showPianoRoll,
    showMixer: state.composition.showMixer,
    pianoRollRegion: state.composition.pianoRollRegion,
});

export default connect(mapStateToProps)(ViewBar);
