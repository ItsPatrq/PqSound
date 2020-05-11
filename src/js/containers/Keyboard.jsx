import React from 'react';
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

class Keyboard extends React.Component {
    constructor() {
        super();
        const that = this;
        window.onkeydown = function (e) {
            if (!e.ctrlKey && !e.altKey) {
                switch (e.key) {
                    case 'q': {
                        that.handleKeyboardKeyDown(0);
                        break;
                    }
                    case '2': {
                        that.handleKeyboardKeyDown(1);
                        break;
                    }
                    case 'w': {
                        that.handleKeyboardKeyDown(2);
                        break;
                    }
                    case 'e': {
                        that.handleKeyboardKeyDown(3);
                        break;
                    }
                    case '4': {
                        that.handleKeyboardKeyDown(4);
                        break;
                    }
                    case 'r': {
                        that.handleKeyboardKeyDown(5);
                        break;
                    }
                    case '5': {
                        that.handleKeyboardKeyDown(6);
                        break;
                    }
                    case 't': {
                        that.handleKeyboardKeyDown(7);
                        break;
                    }
                    case 'y': {
                        that.handleKeyboardKeyDown(8);
                        break;
                    }
                    case '7': {
                        that.handleKeyboardKeyDown(9);
                        break;
                    }
                    case 'u': {
                        that.handleKeyboardKeyDown(10);
                        break;
                    }
                    case '8': {
                        that.handleKeyboardKeyDown(11);
                        break;
                    }
                    case 'i': {
                        that.handleKeyboardKeyDown(12);
                        break;
                    }
                    case '9': {
                        that.handleKeyboardKeyDown(13);
                        break;
                    }
                    case 'o': {
                        that.handleKeyboardKeyDown(14);
                        break;
                    }
                    case 'z': {
                        that.handleKeyboardKeyDown(15);
                        break;
                    }
                    case 's': {
                        that.handleKeyboardKeyDown(16);
                        break;
                    }
                    case 'x': {
                        that.handleKeyboardKeyDown(17);
                        break;
                    }
                    case 'd': {
                        that.handleKeyboardKeyDown(18);
                        break;
                    }
                    case 'c': {
                        that.handleKeyboardKeyDown(19);
                        break;
                    }
                    case 'v': {
                        that.handleKeyboardKeyDown(20);
                        break;
                    }
                    case 'g': {
                        that.handleKeyboardKeyDown(21);
                        break;
                    }
                    case 'b': {
                        that.handleKeyboardKeyDown(22);
                        break;
                    }
                    case 'h': {
                        that.handleKeyboardKeyDown(23);
                        break;
                    }
                    case 'n': {
                        that.handleKeyboardKeyDown(24);
                        break;
                    }
                    case 'j': {
                        that.handleKeyboardKeyDown(25);
                        break;
                    }
                    case 'm': {
                        that.handleKeyboardKeyDown(26);
                        break;
                    }
                    case ',': {
                        that.handleKeyboardKeyDown(27);
                        break;
                    }
                    case 'l': {
                        that.handleKeyboardKeyDown(28);
                        break;
                    }
                    case '.': {
                        that.handleKeyboardKeyDown(29);
                        break;
                    }
                    case ';': {
                        that.handleKeyboardKeyDown(30);
                        break;
                    }
                    case '/': {
                        that.handleKeyboardKeyDown(31);
                        break;
                    }
                }

            }
        }
        window.onkeyup = function (e) {
            if (!e.altKey) {
                switch (e.key) {
                    case 'q': {
                        that.handleKeyboardKeyUp(0);
                        break;
                    }
                    case '2': {
                        that.handleKeyboardKeyUp(1);
                        break;
                    }
                    case 'w': {
                        that.handleKeyboardKeyUp(2);
                        break;
                    }
                    case 'e': {
                        that.handleKeyboardKeyUp(3);
                        break;
                    }
                    case '4': {
                        that.handleKeyboardKeyUp(4);
                        break;
                    }
                    case 'r': {
                        that.handleKeyboardKeyUp(5);
                        break;
                    }
                    case '5': {
                        that.handleKeyboardKeyUp(6);
                        break;
                    }
                    case 't': {
                        that.handleKeyboardKeyUp(7);
                        break;
                    }
                    case 'y': {
                        that.handleKeyboardKeyUp(8);
                        break;
                    }
                    case '7': {
                        that.handleKeyboardKeyUp(9);
                        break;
                    }
                    case 'u': {
                        that.handleKeyboardKeyUp(10);
                        break;
                    }
                    case '8': {
                        that.handleKeyboardKeyUp(11);
                        break;
                    }
                    case 'i': {
                        that.handleKeyboardKeyUp(12);
                        break;
                    }
                    case '9': {
                        that.handleKeyboardKeyUp(13);
                        break;
                    }
                    case 'o': {
                        that.handleKeyboardKeyUp(14);
                        break;
                    }
                    case 'z': {
                        that.handleKeyboardKeyUp(15);
                        break;
                    }
                    case 's': {
                        that.handleKeyboardKeyUp(16);
                        break;
                    }
                    case 'x': {
                        that.handleKeyboardKeyUp(17);
                        break;
                    }
                    case 'd': {
                        that.handleKeyboardKeyUp(18);
                        break;
                    }
                    case 'c': {
                        that.handleKeyboardKeyUp(19);
                        break;
                    }
                    case 'v': {
                        that.handleKeyboardKeyUp(20);
                        break;
                    }
                    case 'g': {
                        that.handleKeyboardKeyUp(21);
                        break;
                    }
                    case 'b': {
                        that.handleKeyboardKeyUp(22);
                        break;
                    }
                    case 'h': {
                        that.handleKeyboardKeyUp(23);
                        break;
                    }
                    case 'n': {
                        that.handleKeyboardKeyUp(24);
                        break;
                    }
                    case 'j': {
                        that.handleKeyboardKeyUp(25);
                        break;
                    }
                    case 'm': {
                        that.handleKeyboardKeyUp(26);
                        break;
                    }
                    case ',': {
                        that.handleKeyboardKeyUp(27);
                        break;
                    }
                    case 'l': {
                        that.handleKeyboardKeyUp(28);
                        break;
                    }
                    case '.': {
                        that.handleKeyboardKeyUp(29);
                        break;
                    }
                    case ';': {
                        that.handleKeyboardKeyUp(30);
                        break;
                    }
                    case '/': {
                        that.handleKeyboardKeyUp(31);
                        break;
                    }
                }
            }
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
                this.props.sound.stop(recordingTracksSounds[i], note)
            }
            this.props.dispatch(Actions.removePlayingNote(note));
        }
        return false;
    }

    handleDown(event, note) {
        event.preventDefault();
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
        if (event.buttons == 1 &&  //leftClick
            !this.props.keyboard.notesPlaying.includes(note)) {
            const recordingTracksSounds = this.getAllRecordingTracks();
            for (let i = 0; i < recordingTracksSounds.length; i++) {
                this.props.sound.play(recordingTracksSounds[i], null, note, SoundOrigin.keyboard)
            }
            this.props.dispatch(Actions.addPlayingNote(note))
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
        let name = '';
        for (let i = 0; i < this.props.keyboard.keyBindings.length; i++) {
            if (this.props.keyboard.keyBindings[i].MIDINote === noteToMIDI(note)) {
                name = this.props.keyboard.keyBindings[i].keyboardKey;
                break;
            }
        }
        return name;
    }

    handleKeyboardKeyDown(note) {
        if (!this.props.textInputFocused) {
            if (!isNullOrUndefined(this.props.keyboard.keyBindings[note]) &&
                !this.props.keyboard.notesPlaying.includes(this.props.keyboard.keyBindings[note].MIDINote)) {
                const recordingTracksSounds = this.getAllRecordingTracks();
                for (let i = 0; i < recordingTracksSounds.length; i++) {
                    this.props.sound.play(recordingTracksSounds[i], null, this.props.keyboard.keyBindings[note].MIDINote, SoundOrigin.keyboard)
                }
                this.props.dispatch(Actions.addPlayingNote(this.props.keyboard.keyBindings[note].MIDINote))
            }
        }

    }

    handleKeyboardKeyUp(note) {
        if (!this.props.textInputFocused) {
            if (!isNullOrUndefined(this.props.keyboard.keyBindings[note]) &&
                this.props.keyboard.notesPlaying.includes(this.props.keyboard.keyBindings[note].MIDINote)) {
                const recordingTracksSounds = this.getAllRecordingTracks();
                for (let i = 0; i < recordingTracksSounds.length; i++) {
                    this.props.sound.stop(recordingTracksSounds[i], this.props.keyboard.keyBindings[note].MIDINote)
                }
                this.props.dispatch(Actions.removePlayingNote(this.props.keyboard.keyBindings[note].MIDINote))
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
        while (keyboardWidths[newFirstVisibleKey].startWidth + this.props.keyboard.width - 122 > keyboardWidths[87].startWidth + 122) {
            newFirstVisibleKey--;
        }
        if (newFirstVisibleKey !== this.props.keyboard.firstKey) {
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
        window.addEventListener('resize', this.updateDimensions.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions.bind(this));
    }

    componentWillMount() {
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
                    while (keyboardWidths[newFirstVisibleKey].startWidth + ComposingCol.offsetWidth - 122 > keyboardWidths[87].startWidth + 122) {
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

            while (currVisible < 88 && keyboardWidths[currVisible].startWidth - keyboardWidths[firstVisibleKey].startWidth <= this.props.keyboard.width - 122) {
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
                        />)
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
                        />)
                }
                currVisible++
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
                    <OptionKeyRight margin={this.props.keyboard.width - 66} onChangeKeyboardRange={this.changeKeyboardRange.bind(this)} />
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
        textInputFocused: state.control.textInputFocused
    }
}

export default connect(mapStateToProps)(Keyboard);