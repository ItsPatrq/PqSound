import * as React from 'react';
import { connect } from 'react-redux';
import {
    switchKeyboardVisibility,
    updateWidth,
    switchKeyNameVisibility,
    switchKeyBindVisibility,
} from 'actions/keyboardActions';
import { loadCompositionState, changeBarsInComposition, switchLoop } from 'actions/compositionActions';
import {
    switchUploadModalVisibility,
    switchAboutModalVisibility,
    loadControlState,
    switchPlayState,
    changeTool,
    changeBPM,
    textInputFocusedSwitch,
} from 'actions/controlActions';
import { loadTrackState, updateAllTrackNodes, changeRecordState } from 'actions/trackListActions';
import { KEYBOARD_VIEW_WIDTH } from 'constants/Constants';
import { fetchSamplerInstrument } from 'actions/webAudioActions';
import * as Utils from 'engine/Utils';
import AudioEngine from 'engine/AudioEngine';
import { tools, TrackTypes } from 'constants/Constants';
import FileUploadModal from 'components/FileUploadModal';
import AboutModal from 'components/AboutModal';
import Demo from 'constants/Demo';

const C = {
    inset: '#0e1113',
    border: '#23282c',
    control: '#191d21',
    ctrlBorder: '#2a3035',
    text: '#e4e7e9',
    textHi: '#f2f5f6',
    dim: '#9aa2a8',
    dimmer: '#838b91',
    faint: '#5d656b',
    accent: 'var(--pq-accent)',
};

/** Transport tools mapped onto the real Constants.tools ids. */
const TOOL_DEFS = [
    { id: tools.select.id, glyph: '⌖', title: 'Pointer' },
    { id: tools.draw.id, glyph: '✎', title: 'Draw' },
    { id: tools.remove.id, glyph: '⌫', title: 'Erase' },
    { id: tools.copyPaste.id, glyph: '⧸', title: 'Split' },
];

class Header extends React.Component {
    constructor() {
        super();
        // `editing` is 'bpm' | 'bars' | null; temp* hold the in-flight input value.
        // (LOOP now backed by composition.loopEnabled, REC by the selected track's
        // record flag — neither is local state anymore.)
        this.state = { menuOpen: false, editing: null, tempBPM: '', tempBars: '' };
        // Alt-key keyboard shortcuts (ported from the old TopNavBar).
        window.addEventListener(
            'keydown',
            (e) => {
                if (!e.altKey) return;
                switch (e.keyCode) {
                    case 80:
                        this.toggleKeyboard();
                        break;
                    case 78:
                        this.props.dispatch(switchKeyBindVisibility());
                        break;
                    case 66:
                        this.props.dispatch(switchKeyNameVisibility());
                        break;
                }
            },
            false,
        );
    }

    componentDidMount() {
        this.toggleKeyboard();
    }

    // Keyboard is a fixed-size inset panel now → set its constant width, no
    // longer measured off the composing area.
    toggleKeyboard() {
        if (this.props.keyboardWidth !== KEYBOARD_VIEW_WIDTH) {
            this.props.dispatch(updateWidth(KEYBOARD_VIEW_WIDTH));
        }
        this.props.dispatch(switchKeyboardVisibility());
    }

    /* ---- transport ---- */
    handlePlay() {
        const { controlState } = this.props;
        if (!controlState.playing) {
            this.props.dispatch(switchPlayState());
            AudioEngine.getSequencer().handlePlay();
        }
    }
    handleStop() {
        const { controlState } = this.props;
        if (controlState.playing) this.props.dispatch(switchPlayState());
        AudioEngine.getSequencer().handleStop();
    }
    toggleRecord() {
        // Arm/disarm recording on the currently-selected track. Keyboard/MIDI note
        // input records into every track whose `record` flag is set (see
        // Keyboard.getAllRecordingTracks) — so this button is the transport-level arm.
        this.props.dispatch(changeRecordState(this.props.selected));
    }
    toggleLoop() {
        this.props.dispatch(switchLoop());
    }
    toggleMenu() {
        this.setState((s) => ({ menuOpen: !s.menuOpen }));
    }
    closeMenu() {
        this.setState({ menuOpen: false });
    }

    handleTool(id) {
        if (id !== this.props.controlState.tool) this.props.dispatch(changeTool(id));
    }

    /* ---- inline BPM / BARS editing (reuses the textInputFocused keyboard guard) ---- */
    beginEdit(which) {
        const seed = which === 'bpm' ? String(this.props.controlState.BPM) : String(this.props.barsInComposition);
        this.setState({ editing: which, tempBPM: seed, tempBars: seed });
        this.props.dispatch(textInputFocusedSwitch());
    }
    endEdit() {
        // Mirror the exit path of the old ControlBar input: commit then release the guard.
        if (this.state.editing === 'bpm') this.commitBPM();
        else if (this.state.editing === 'bars') this.commitBars();
        this.setState({ editing: null });
        this.props.dispatch(textInputFocusedSwitch());
    }
    commitBPM() {
        const { minBPM, maxBPM, BPM } = this.props.controlState;
        const v = Number(this.state.tempBPM);
        if (Number.isFinite(v) && v >= minBPM && v <= maxBPM && v !== BPM) {
            this.props.dispatch(changeBPM(v));
        }
    }
    commitBars() {
        const v = Number(this.state.tempBars);
        if (
            Number.isInteger(v) &&
            v >= 48 &&
            v <= this.props.maxBarsInComposition &&
            v !== this.props.barsInComposition
        ) {
            this.props.dispatch(changeBarsInComposition(v));
        }
    }
    onEditKeyDown(e) {
        if (e.keyCode === 13 /* ENTER */) e.target.blur();
    }

    /* ---- position readouts ---- */
    positionLabel() {
        const s = this.props.controlState.sixteenthNotePlaying || 0;
        const bar = Math.floor(s / 16) + 1;
        const beat = Math.floor((s % 16) / 4) + 1;
        return bar + '.' + beat;
    }
    clockLabel() {
        const s = this.props.controlState.sixteenthNotePlaying || 0;
        const bpm = this.props.controlState.BPM || 120;
        const secs = (s * (60 / bpm)) / 4;
        const m = Math.floor(secs / 60);
        const r = secs - m * 60;
        return String(m).padStart(2, '0') + ':' + r.toFixed(2).padStart(5, '0');
    }

    /* ---- menu: import / export / demo (ported from TopNavBar) ---- */
    getExportData() {
        const tempControl = Utils.copy(this.props.control);
        // MIDI device selection is per-session hardware state, not composition data.
        delete tempControl['midi'];
        const tempTracks = Utils.copy(this.props.tracks);
        for (let i = 0; i < tempTracks.trackList.length; i++) {}
        return encodeURIComponent(
            JSON.stringify({ tracks: tempTracks, control: tempControl, composition: this.props.composition }),
        );
    }
    export() {
        const link = document.createElement('a');
        link.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(this.getExportData()));
        link.setAttribute('download', 'PqSoundComposition.json');
        link.click();
    }
    loadComposition(binaryString) {
        const loaded = JSON.parse(decodeURIComponent(binaryString));
        this.props.dispatch(loadTrackState(loaded.tracks));
        this.props.dispatch(loadControlState(loaded.control));
        this.props.dispatch(loadCompositionState(loaded.composition));
        this.props.dispatch(updateAllTrackNodes());
        for (let i = 1; i < loaded.tracks.trackList.length; i++) {
            if (loaded.tracks.trackList[i].trackType === TrackTypes.virtualInstrument) {
                for (let j = 0; j < this.props.samplerInstruments.length; j++) {
                    if (
                        loaded.tracks.trackList[i].instrument.id === 0 &&
                        this.props.samplerInstruments[j].id === loaded.tracks.trackList[i].instrument.preset.id &&
                        !this.props.samplerInstruments[j].loaded &&
                        !this.props.samplerInstruments[j].fetching
                    ) {
                        this.props.dispatch(fetchSamplerInstrument(loaded.tracks.trackList[i].instrument.preset.id));
                    }
                }
            }
        }
    }
    handleFileUpload(accepted, rejected) {
        if (accepted.length > 0) {
            const reader = new FileReader();
            reader.onload = () => this.loadComposition(reader.result);
            reader.onabort = () => console.log('file reading was aborted');
            reader.onerror = () => console.log('file reading has failed');
            reader.readAsBinaryString(accepted[0]);
        }
        if (rejected.length > 0) console.log(rejected);
    }

    menuItems() {
        return [
            { label: 'Import…', hint: '⌘I', onClick: () => this.props.dispatch(switchUploadModalVisibility()) },
            { label: 'Export JSON…', hint: '⌘E', onClick: () => this.export() },
            { label: 'Load demo', hint: '', onClick: () => this.loadComposition(Demo) },
            {
                label: this.props.keyboardVisible ? 'Hide keyboard' : 'Show keyboard',
                hint: '⌥P',
                onClick: () => this.toggleKeyboard(),
            },
            { label: 'About PqSound', hint: '', onClick: () => this.props.dispatch(switchAboutModalVisibility()) },
        ];
    }

    render() {
        const { controlState, barsInComposition, control } = this.props;
        const { menuOpen, editing, tempBPM, tempBars } = this.state;
        const rec = this.props.recording;
        const loop = this.props.loopEnabled;
        const playing = controlState.playing;

        const editInput = (value, onChange) => (
            <input
                autoFocus
                className="pq-mono pq-header-edit"
                value={value}
                onChange={onChange}
                onKeyDown={(e) => this.onEditKeyDown(e)}
                onBlur={() => this.endEdit()}
            />
        );

        return (
            <div className="pq-header">
                {/* identity */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '0 14px',
                        height: '100%',
                        borderRight: `1px solid ${C.border}`,
                    }}
                >
                    <div className="pq-brand" style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.3px', color: C.textHi }}>
                            Pq
                        </span>
                        <span style={{ fontSize: 15, fontWeight: 400, letterSpacing: '-0.3px', color: C.dimmer }}>
                            Sound
                        </span>
                    </div>
                    <div style={{ width: 1, height: 18, background: '#2a3035' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 11.5, color: C.text, whiteSpace: 'nowrap' }}>untitled project</span>
                        <span className="pq-mono" style={{ fontSize: 9, letterSpacing: '0.08em', color: C.faint }}>
                            {barsInComposition} BARS
                        </span>
                    </div>
                </div>

                {/* center: tools · transport · out meter */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(min-content,1fr) auto minmax(min-content,1fr)',
                        alignItems: 'center',
                        gap: 16,
                        padding: '0 14px',
                        height: '100%',
                        minWidth: 0,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {TOOL_DEFS.map((t) => (
                            <button
                                key={t.id}
                                title={t.title}
                                onClick={() => this.handleTool(t.id)}
                                className={'pq-btn pq-tool' + (controlState.tool === t.id ? ' is-active' : '')}
                            >
                                {t.glyph}
                            </button>
                        ))}
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            background: C.inset,
                            border: `1px solid ${C.border}`,
                            borderRadius: 8,
                            padding: '5px 6px',
                        }}
                    >
                        <button
                            title="Record"
                            onClick={() => this.toggleRecord()}
                            style={{
                                width: 30,
                                height: 30,
                                marginRight: 4,
                                display: 'grid',
                                placeItems: 'center',
                                borderRadius: 5,
                                cursor: 'pointer',
                                border: `1px solid ${rec ? 'rgba(210,84,75,0.8)' : C.ctrlBorder}`,
                                background: rec ? 'rgba(200,70,60,0.16)' : C.control,
                            }}
                        >
                            <span
                                style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    display: 'block',
                                    background: rec ? 'var(--pq-rec)' : '#4b5560',
                                }}
                            />
                        </button>
                        <button
                            title="Play"
                            onClick={() => this.handlePlay()}
                            style={{
                                width: 34,
                                height: 30,
                                display: 'grid',
                                placeItems: 'center',
                                borderRadius: 5,
                                cursor: 'pointer',
                                border: `1px solid ${playing ? C.accent : C.ctrlBorder}`,
                                background: playing ? C.accent : C.control,
                                color: playing ? '#08121a' : C.text,
                            }}
                        >
                            <span style={{ fontSize: 11, lineHeight: 1 }}>{playing ? '❙❙' : '▶'}</span>
                        </button>
                        <button
                            title="Stop"
                            onClick={() => this.handleStop()}
                            className="pq-btn"
                            style={{
                                width: 30,
                                height: 30,
                                display: 'grid',
                                placeItems: 'center',
                                color: C.dim,
                                background: C.control,
                            }}
                        >
                            <span style={{ width: 9, height: 9, background: 'currentColor', display: 'block' }} />
                        </button>

                        <div className="pq-header-divider" />

                        <div
                            className="pq-mono"
                            style={{ display: 'flex', alignItems: 'baseline', gap: 5, paddingRight: 4 }}
                        >
                            <span style={{ fontSize: 20, fontWeight: 500, letterSpacing: '0.02em', color: C.textHi }}>
                                {this.positionLabel()}
                            </span>
                            <span style={{ fontSize: 10, color: C.faint, letterSpacing: '0.08em' }}>BAR.BEAT</span>
                        </div>
                        <div className="pq-mono" style={{ paddingRight: 6 }}>
                            <span style={{ fontSize: 13, color: C.dim }}>{this.clockLabel()}</span>
                        </div>

                        <div className="pq-header-divider" />

                        <div
                            className="pq-mono"
                            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 8px' }}
                        >
                            <div
                                className="pq-header-editable"
                                onClick={() => editing !== 'bpm' && this.beginEdit('bpm')}
                                title="Click to edit tempo"
                                style={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                            >
                                {editing === 'bpm' ? (
                                    editInput(tempBPM, (e) => this.setState({ tempBPM: e.target.value }))
                                ) : (
                                    <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>
                                        {(controlState.BPM || 120).toFixed(1)}
                                    </span>
                                )}
                                <span style={{ fontSize: 8.5, letterSpacing: '0.1em', color: C.faint }}>BPM</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>4/4</span>
                                <span style={{ fontSize: 8.5, letterSpacing: '0.1em', color: C.faint }}>SIG</span>
                            </div>
                            <div
                                className="pq-header-editable"
                                onClick={() => editing !== 'bars' && this.beginEdit('bars')}
                                title="Click to edit bars"
                                style={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                            >
                                {editing === 'bars' ? (
                                    editInput(tempBars, (e) => this.setState({ tempBars: e.target.value }))
                                ) : (
                                    <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>
                                        {barsInComposition}
                                    </span>
                                )}
                                <span style={{ fontSize: 8.5, letterSpacing: '0.1em', color: C.faint }}>BARS</span>
                            </div>
                        </div>

                        <div className="pq-header-divider" />

                        <button
                            onClick={() => this.toggleLoop()}
                            className={'pq-btn' + (loop ? ' is-active' : '')}
                            style={{
                                height: 26,
                                padding: '0 10px',
                                fontFamily: 'var(--pq-mono)',
                                fontSize: 10,
                                letterSpacing: '0.08em',
                            }}
                        >
                            LOOP
                        </button>
                    </div>

                    {/* right grid cell — kept empty to preserve the centered transport
                        layout; the OUT meter moved to the bottom view bar per the design. */}
                    <div />
                </div>

                {/* right: share + menu */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '0 14px',
                        height: '100%',
                        borderLeft: `1px solid ${C.border}`,
                        position: 'relative',
                    }}
                >
                    <button
                        className="pq-share"
                        style={{
                            height: 28,
                            padding: '0 12px',
                            borderRadius: 5,
                            border: `1px solid ${C.ctrlBorder}`,
                            background: C.control,
                            color: C.text,
                            cursor: 'pointer',
                            fontSize: 11.5,
                        }}
                    >
                        Share
                    </button>
                    <button
                        title="Menu"
                        onClick={() => this.toggleMenu()}
                        className={'pq-btn' + (menuOpen ? ' is-active' : '')}
                        style={{
                            width: 28,
                            height: 28,
                            display: 'grid',
                            placeItems: 'center',
                            lineHeight: 0,
                            color: C.text,
                        }}
                    >
                        <span style={{ fontSize: 15, letterSpacing: '1px', position: 'relative', top: -3 }}>···</span>
                    </button>
                    {menuOpen && (
                        <div
                            style={{
                                position: 'absolute',
                                top: 48,
                                right: 12,
                                width: 188,
                                padding: 6,
                                background: '#1a1e22',
                                border: '1px solid #2f353a',
                                borderRadius: 8,
                                boxShadow: '0 18px 40px rgba(0,0,0,0.55)',
                                zIndex: 40,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                            }}
                        >
                            {this.menuItems().map((mi) => (
                                <div
                                    key={mi.label}
                                    className="pq-menu-item"
                                    onClick={() => {
                                        this.closeMenu();
                                        mi.onClick();
                                    }}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '7px 9px',
                                        borderRadius: 5,
                                        cursor: 'pointer',
                                        color: C.text,
                                        fontSize: 12,
                                    }}
                                >
                                    <span>{mi.label}</span>
                                    <span className="pq-mono" style={{ fontSize: 9.5, color: C.faint }}>
                                        {mi.hint}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    <FileUploadModal
                        showModal={control.showUploadModal}
                        modalVisibilitySwitch={() => this.props.dispatch(switchUploadModalVisibility())}
                        onFileUpload={this.handleFileUpload.bind(this)}
                    />
                    <AboutModal
                        showModal={control.showAboutModal}
                        modalVisibilitySwitch={() => this.props.dispatch(switchAboutModalVisibility())}
                    />
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const selected = state.tracks.selected;
    const selectedTrack = state.tracks.trackList.find((t) => t.index === selected);
    return {
        controlState: state.control,
        control: state.control,
        composition: state.composition,
        tracks: state.tracks,
        selected: selected,
        recording: !!(selectedTrack && selectedTrack.record),
        barsInComposition: state.composition.barsInComposition,
        maxBarsInComposition: state.composition.maxBarsInComposition,
        loopEnabled: state.composition.loopEnabled,
        keyboardVisible: state.keyboard.show,
        keyboardWidth: state.keyboard.width,
        samplerInstruments: state.webAudio.samplerInstrumentsSounds.map((v) => ({
            name: v.name,
            loaded: v.loaded,
            id: v.id,
            fetching: v.fetching,
        })),
    };
};

export default connect(mapStateToProps)(Header);
