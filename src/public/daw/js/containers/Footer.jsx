import * as React from 'react';
import { connect } from 'react-redux';
import { changeMidiDevice } from 'actions/controlActions';
import { switchKeyboardVisibility, updateWidth } from 'actions/keyboardActions';
import { KEYBOARD_VIEW_WIDTH, KEYBOARD_VISIBLE_OCTAVES } from 'constants/Constants';
import * as Utils from 'engine/Utils';

const C = {
    inset: '#0e1113',
    border: '#23282c',
    control: '#191d21',
    ctrlBorder: '#2a3035',
    text: '#e4e7e9',
    dim: '#9aa2a8',
    dimmer: '#838b91',
    faint: '#5d656b',
    accent: 'var(--pq-accent)',
    warn: 'var(--pq-warn)',
};

class Footer extends React.Component {
    constructor() {
        super();
        this.state = { midiOpen: false };
    }

    /* ---- MIDI device selector (ported from ControlBar) ---- */
    midiTitle() {
        const mc = this.props.midiController;
        if (!mc.MIDISupported) return 'Web MIDI not supported';
        if (mc.devices.input.length === 0) return 'No devices detected';
        if (Utils.isNullOrUndefined(mc.selectedInputDevice)) return 'No device selected';
        return mc.selectedInputDevice.name;
    }

    selectDevice(deviceId) {
        const mc = this.props.midiController;
        const sel = mc.selectedInputDevice;
        if (
            !(deviceId === null && Utils.isNullOrUndefined(sel)) &&
            (Utils.isNullOrUndefined(sel) || deviceId !== sel.id)
        ) {
            this.props.dispatch(changeMidiDevice(deviceId));
        }
        this.setState({ midiOpen: false });
    }

    toggleMidi() {
        if (this.props.midiController.devices.input.length > 0) {
            this.setState((s) => ({ midiOpen: !s.midiOpen }));
        }
    }

    /* ---- keyboard toggle (same logic as Header) ---- */
    // Keyboard is a fixed-size inset panel now → set its constant width, no
    // longer measured off the composing area.
    toggleKeyboard() {
        if (this.props.keyboardWidth !== KEYBOARD_VIEW_WIDTH) {
            this.props.dispatch(updateWidth(KEYBOARD_VIEW_WIDTH));
        }
        this.props.dispatch(switchKeyboardVisibility());
    }

    /* ---- readouts ---- */
    octaveLabel() {
        // firstKey is an index into the 88-key layout (0 = A0). Octave number
        // ≈ floor((index + 9) / 12). Span is cosmetic (matches design OCT n–n).
        const low = Math.floor((this.props.firstKey + 9) / 12);
        return `OCT ${low}–${low + KEYBOARD_VISIBLE_OCTAVES}`;
    }
    render() {
        const { midiController, sampleRate, keyboardVisible } = this.props;
        const { midiOpen } = this.state;
        const devices = midiController.devices.input;
        const devicesEnabled = devices.length > 0;

        const stat = (label, value, valueColor) => (
            <div className="pq-footer-stat">
                <span className="pq-mono pq-footer-label">{label}</span>
                <span className="pq-mono pq-footer-value" style={{ color: valueColor || C.text }}>
                    {value}
                </span>
            </div>
        );

        return (
            <div className="pq-footer">
                {/* left: MIDI device + sample/rate status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
                    <span className="pq-mono pq-footer-label">MIDI</span>
                    <button
                        className={'pq-footer-select' + (devicesEnabled ? '' : ' is-disabled')}
                        onClick={() => this.toggleMidi()}
                        disabled={!devicesEnabled}
                        title={this.midiTitle()}
                    >
                        <span
                            style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: !Utils.isNullOrUndefined(midiController.selectedInputDevice)
                                    ? C.accent
                                    : '#4b5560',
                            }}
                        />
                        <span className="pq-footer-select-name">{this.midiTitle()}</span>
                        <span style={{ color: C.faint, fontSize: 9 }}>▾</span>
                    </button>
                    {midiOpen && devicesEnabled && (
                        <div className="pq-footer-menu">
                            <div className="pq-footer-menu-item" onClick={() => this.selectDevice(null)}>
                                None
                            </div>
                            {devices.map((d) => (
                                <div key={d.id} className="pq-footer-menu-item" onClick={() => this.selectDevice(d.id)}>
                                    {d.name}
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="pq-footer-divider" />
                    {stat('RATE', sampleRate ? `${(sampleRate / 1000).toFixed(1)} kHz` : '—', C.dim)}
                </div>

                {/* right: octave range + keyboard toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                    {stat('RANGE', this.octaveLabel(), C.dim)}
                    <div className="pq-footer-divider" />
                    <button
                        onClick={() => this.toggleKeyboard()}
                        className={'pq-btn pq-footer-kbd' + (keyboardVisible ? ' is-active' : '')}
                        title="Toggle keyboard"
                    >
                        Keyboard <span style={{ color: C.faint, fontSize: 9 }}>▾</span>
                    </button>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    midiController: state.control.midiController,
    sampleRate: state.webAudio.sampleRate,
    firstKey: state.keyboard.firstKey,
    keyboardVisible: state.keyboard.show,
    keyboardWidth: state.keyboard.width,
});

export default connect(mapStateToProps)(Footer);
