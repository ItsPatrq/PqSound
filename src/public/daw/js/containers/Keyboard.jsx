import * as React from 'react';
import { connect } from 'react-redux';
import { SoundOrigin, keyboardWidths, defaultKeysNames } from 'constants/Constants';
import { isNullOrUndefined, getTrackByIndex, noteToMIDI } from 'engine/Utils';
import * as Actions from 'actions/keyboardActions';
import WhiteKey from 'components/Keyboard/WhiteKey';
import BlackKey from 'components/Keyboard/BlackKey';
import DisabledKey from 'components/Keyboard/DisabledKey';
import OptionKeyLeft from 'components/Keyboard/OptionKeyLeft';
import OptionKeyRight from 'components/Keyboard/OptionKeyRight';
import { Row } from 'react-bootstrap';

// Maps a physical keyboard key to its 0-based piano key index.
const KEY_TO_INDEX = {
    q: 0,
    2: 1,
    w: 2,
    e: 3,
    4: 4,
    r: 5,
    5: 6,
    t: 7,
    y: 8,
    7: 9,
    u: 10,
    8: 11,
    i: 12,
    9: 13,
    o: 14,
    z: 15,
    s: 16,
    x: 17,
    d: 18,
    c: 19,
    v: 20,
    g: 21,
    b: 22,
    h: 23,
    n: 24,
    j: 25,
    m: 26,
    ',': 27,
    l: 28,
    '.': 29,
    ';': 30,
    '/': 31,
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

    changeKeyboardRange(direction) {
        let newFirstVisibleKey = this.props.keyboard.firstKey + direction;
        if (newFirstVisibleKey < 0) {
            newFirstVisibleKey = 0;
        } else if (newFirstVisibleKey > 87) {
            newFirstVisibleKey = 87;
        }
        if (direction > 0 && keyboardWidths[newFirstVisibleKey].sharp) {
            newFirstVisibleKey++;
        } else if (direction < 0 && keyboardWidths[newFirstVisibleKey].sharp) {
            newFirstVisibleKey--;
        }
        while (
            keyboardWidths[newFirstVisibleKey].startWidth + this.props.keyboard.width - 122 >
            keyboardWidths[87].startWidth + 122
        ) {
            newFirstVisibleKey--;
        }
        if (newFirstVisibleKey !== this.props.keyboard.firstKey) {
            console.log(newFirstVisibleKey, this.props.keyboard.firstKey, direction);
            if (Math.floor(newFirstVisibleKey / 12) !== Math.floor(this.props.keyboard.firstKey / 12)) {
                if (direction > 0) {
                    this.props.dispatch(Actions.changeKeyBindings(12));
                } else {
                    this.props.dispatch(Actions.changeKeyBindings(-12));
                }
            }
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

    updateDimensions() {
        if (this.props.keyboard.show) {
            const ComposingCol = document.getElementById('ComposingCol');
            if (isNullOrUndefined(ComposingCol)) {
                if (this.props.keyboard.width !== 0) {
                    this.props.dispatch(Actions.updateWidth(0));
                }
            } else if (ComposingCol.offsetWidth !== this.props.keyboard.width) {
                if (ComposingCol.offsetWidth > this.props.keyboard.width) {
                    let newFirstVisibleKey = this.props.keyboard.firstKey;
                    while (
                        keyboardWidths[newFirstVisibleKey].startWidth + ComposingCol.offsetWidth - 122 >
                        keyboardWidths[87].startWidth + 122
                    ) {
                        newFirstVisibleKey--;
                    }
                    if (newFirstVisibleKey !== this.props.keyboard.firstKey) {
                        this.props.dispatch(Actions.changeFirstKeyboardKey(newFirstVisibleKey));
                    }
                }
                this.props.dispatch(Actions.updateWidth(ComposingCol.offsetWidth));
            }
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
                    this.props.keyboard.width - 122
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
                    <Row className="keysRow">
                        {whiteKeysToRender}
                        {blackKeysToRender}
                        <DisabledKey />
                    </Row>
                    <OptionKeyRight
                        margin={this.props.keyboard.width - 66}
                        onChangeKeyboardRange={this.changeKeyboardRange.bind(this)}
                    />
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
