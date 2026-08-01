import * as React from 'react';
import { connect } from 'react-redux';
import {
    SoundOrigin,
    keyboardWidths,
    defaultKeysNames,
    KEYBOARD_BASE_OFFSET,
    KEYBOARD_VIEW_WIDTH,
} from 'constants/Constants';
import { isNullOrUndefined, getTrackByIndex, noteToMIDI } from 'engine/Utils';
import * as Actions from 'actions/keyboardActions';
import WhiteKey from 'components/Keyboard/WhiteKey';
import BlackKey from 'components/Keyboard/BlackKey';
import DisabledKey from 'components/Keyboard/DisabledKey';
import OptionKeyLeft from 'components/Keyboard/OptionKeyLeft';
import OptionKeyRight from 'components/Keyboard/OptionKeyRight';

// Maps a physical keyboard key to its 0-based binding index. Same order as
// `keyboardKeyOrder`/`defaultKeyBindings` in Constants (C-based, 2 octaves) so the
// shortcut a key triggers is exactly the one drawn on the aligned visible key.
const KEY_TO_INDEX = {
    q: 0,
    2: 1,
    w: 2,
    3: 3,
    e: 4,
    r: 5,
    5: 6,
    t: 7,
    6: 8,
    y: 9,
    7: 10,
    u: 11,
    z: 12,
    s: 13,
    x: 14,
    d: 15,
    c: 16,
    v: 17,
    g: 18,
    b: 19,
    h: 20,
    n: 21,
    j: 22,
    m: 23,
};

class Keyboard extends React.Component {
    constructor() {
        super();
        this.handleGlobalKeyDown = this.handleGlobalKeyDown.bind(this);
        this.handleGlobalKeyUp = this.handleGlobalKeyUp.bind(this);
        this.updateDimensions = this.updateDimensions.bind(this);
    }

    handleGlobalKeyDown(e) {
        if (e.ctrlKey || e.altKey) {
            return;
        }
        const index = KEY_TO_INDEX[e.key];
        if (index !== undefined) {
            this.handleKeyboardKeyDown(index);
        }
    }

    handleGlobalKeyUp(e) {
        if (e.altKey) {
            return;
        }
        const index = KEY_TO_INDEX[e.key];
        if (index !== undefined) {
            this.handleKeyboardKeyUp(index);
        }
    }

    getAllRecordingTracks() {
        const recordingTracksSounds = [];
        for (let i = 1; i < this.props.trackList.length; i++) {
            if (this.props.trackList[i].record) {
                recordingTracksSounds.push(this.props.trackList[i].index);
            }
        }
        return recordingTracksSounds;
    }

    handleUp(event, note) {
        event.preventDefault();
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
        if (this.props.keyboard.notesPlaying.includes(note)) {
            const recordingTracksSounds = this.getAllRecordingTracks();
            for (let i = 0; i < recordingTracksSounds.length; i++) {
                this.props.sound.stop(recordingTracksSounds[i], note);
            }
            this.props.dispatch(Actions.removePlayingNote(note));
        }
        return false;
    }

    handleDown(event, note) {
        event.preventDefault();
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
        if (
            event.buttons == 1 && //leftClick
            !this.props.keyboard.notesPlaying.includes(note)
        ) {
            const recordingTracksSounds = this.getAllRecordingTracks();
            for (let i = 0; i < recordingTracksSounds.length; i++) {
                this.props.sound.play(recordingTracksSounds[i], null, note, SoundOrigin.keyboard);
            }
            this.props.dispatch(Actions.addPlayingNote(note));
        }
        return false;
    }

    getKeyName(note) {
        const recordingTracksSounds = this.getAllRecordingTracks();
        if (recordingTracksSounds.length === 1) {
            return getTrackByIndex(this.props.trackList, recordingTracksSounds[0]).instrument.getNoteName(note);
        }
    }

    getDefaultKeyName(note) {
        return defaultKeysNames[note];
    }

    getBindingName(note) {
        let res = '';
        this.props.keyboard.keyBindings.some((keyBiding) => {
            if (keyBiding.MIDINote === noteToMIDI(note)) {
                res = keyBiding.keyboardKey;
                return true;
            }
        });

        return res;
    }

    handleKeyboardKeyDown(note) {
        if (!this.props.textInputFocused) {
            if (
                !isNullOrUndefined(this.props.keyboard.keyBindings[note]) &&
                !this.props.keyboard.notesPlaying.includes(this.props.keyboard.keyBindings[note].MIDINote)
            ) {
                if (this.props.audioContext.state !== 'running') {
                    this.props.audioContext.resume();
                }
                const recordingTracksSounds = this.getAllRecordingTracks();
                for (let i = 0; i < recordingTracksSounds.length; i++) {
                    this.props.sound.play(
                        recordingTracksSounds[i],
                        null,
                        this.props.keyboard.keyBindings[note].MIDINote,
                        SoundOrigin.keyboard,
                    );
                }
                this.props.dispatch(Actions.addPlayingNote(this.props.keyboard.keyBindings[note].MIDINote));
            }
        }
    }

    handleKeyboardKeyUp(note) {
        if (!this.props.textInputFocused) {
            if (
                !isNullOrUndefined(this.props.keyboard.keyBindings[note]) &&
                this.props.keyboard.notesPlaying.includes(this.props.keyboard.keyBindings[note].MIDINote)
            ) {
                const recordingTracksSounds = this.getAllRecordingTracks();
                for (let i = 0; i < recordingTracksSounds.length; i++) {
                    this.props.sound.stop(recordingTracksSounds[i], this.props.keyboard.keyBindings[note].MIDINote);
                }
                this.props.dispatch(Actions.removePlayingNote(this.props.keyboard.keyBindings[note].MIDINote));
            }
        }
    }

    // Octave stepping (direction = ±12). firstKey stays locked on a C so the visible
    // range always starts on C, clamped to the octaves whose 2-octave window fits the
    // 88 keys. The key-bindings shift by the same delta so the on-key shortcut labels
    // stay aligned with the visible keys.
    changeKeyboardRange(direction) {
        const MIN_FIRST = 15; // C2
        const MAX_FIRST = 63; // C6 (C6..C8 = 63..87 still fits)
        let newFirstVisibleKey = this.props.keyboard.firstKey + direction;
        if (newFirstVisibleKey < MIN_FIRST) {
            newFirstVisibleKey = MIN_FIRST;
        } else if (newFirstVisibleKey > MAX_FIRST) {
            newFirstVisibleKey = MAX_FIRST;
        }
        if (newFirstVisibleKey !== this.props.keyboard.firstKey) {
            this.props.dispatch(Actions.changeKeyBindings(newFirstVisibleKey - this.props.keyboard.firstKey));
            this.props.dispatch(Actions.changeFirstKeyboardKey(newFirstVisibleKey));
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this.updateDimensions);
        window.addEventListener('keydown', this.handleGlobalKeyDown);
        window.addEventListener('keyup', this.handleGlobalKeyUp);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
        window.removeEventListener('keydown', this.handleGlobalKeyDown);
        window.removeEventListener('keyup', this.handleGlobalKeyUp);
    }

    UNSAFE_componentWillMount() {
        this.updateDimensions();
    }

    // The keyboard is a fixed-size (~2-octave) inset panel; its width is a constant,
    // no longer measured off the composing area. (Range stays C-locked & clamped in
    // changeKeyboardRange.)
    updateDimensions() {
        if (this.props.keyboard.show && this.props.keyboard.width !== KEYBOARD_VIEW_WIDTH) {
            this.props.dispatch(Actions.updateWidth(KEYBOARD_VIEW_WIDTH));
        }
    }

    render() {
        if (this.props.keyboard.show) {
            const firstVisibleKey = this.props.keyboard.firstKey;

            let currVisible = firstVisibleKey;
            const whiteKeysToRender = [];
            const blackKeysToRender = [];

            while (
                currVisible < 88 &&
                keyboardWidths[currVisible].startWidth - keyboardWidths[firstVisibleKey].startWidth <=
                    this.props.keyboard.width - KEYBOARD_BASE_OFFSET
            ) {
                if (keyboardWidths[currVisible].sharp) {
                    blackKeysToRender.push(
                        <BlackKey
                            key={currVisible}
                            note={noteToMIDI(currVisible)}
                            margin={keyboardWidths[currVisible].startWidth - keyboardWidths[firstVisibleKey].startWidth}
                            handleMouseOver={this.handleDown.bind(this)}
                            handleMouseLeave={this.handleUp.bind(this)}
                            isPressed={this.props.keyboard.notesPlaying.includes(noteToMIDI(currVisible))}
                            keyName={this.getDefaultKeyName(currVisible)}
                            keyNameVisible={this.props.keyboard.keyNamesVisible}
                            keyBindingVisible={this.props.keyboard.keyBindVisible}
                            keyBind={this.getBindingName(currVisible)}
                        />,
                    );
                } else {
                    whiteKeysToRender.push(
                        <WhiteKey
                            key={currVisible}
                            note={noteToMIDI(currVisible)}
                            handleMouseOver={this.handleDown.bind(this)}
                            handleMouseLeave={this.handleUp.bind(this)}
                            isPressed={this.props.keyboard.notesPlaying.includes(noteToMIDI(currVisible))}
                            keyName={this.getDefaultKeyName(currVisible)}
                            keyNameVisible={this.props.keyboard.keyNamesVisible}
                            keyBindingVisible={this.props.keyboard.keyBindVisible}
                            keyBind={this.getBindingName(currVisible)}
                        />,
                    );
                }
                currVisible++;
            }
            return (
                /**
                 * Disabled key here to make it possible to see whole last button
                 */
                <div className="keyboardBody">
                    <div className="colorLine"></div>
                    <OptionKeyLeft onChangeKeyboardRange={this.changeKeyboardRange.bind(this)} />
                    <div className="keysRow">
                        {whiteKeysToRender}
                        {blackKeysToRender}
                        <DisabledKey />
                    </div>
                    <OptionKeyRight onChangeKeyboardRange={this.changeKeyboardRange.bind(this)} />
                </div>
            );
        }
        return null;
    }
}

//REDUX connection
const mapStateToProps = (state) => {
    return {
        keyboard: state.keyboard,
        trackList: state.tracks.trackList,
        sound: state.webAudio.sound,
        textInputFocused: state.control.textInputFocused,
        audioContext: state.webAudio.context,
    };
};

export default connect(mapStateToProps)(Keyboard);
