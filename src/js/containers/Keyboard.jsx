import React from 'react';
import { connect } from 'react-redux';
import { SoundOrigin, keyboardWidths } from 'constants/Constants';
import { isNullOrUndefined } from 'engine/Utils';
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
        // this.notesPlaying = new Array;
        // window.onkeyup = function(e) {
        //     console.log(e);
        //  }
    }

    getAllRecordingTracks() {
        let recordingTracksSounds = new Array;
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
        if (this.props.keyboard.notesPlaying.length > 0) {
            let recordingTracksSounds = this.getAllRecordingTracks();
            for (let i = 0; i < recordingTracksSounds.length; i++) {
                this.props.sound.stop(recordingTracksSounds[i], note)
                this.props.dispatch(Actions.removePlayingNote(note));
            }
        }
        return false;
    }

    handleDown(event, note) {
        event.preventDefault();
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
        if (event.buttons == 1) {
            let recordingTracksSounds = this.getAllRecordingTracks();
            for (let i = 0; i < recordingTracksSounds.length; i++) {
                this.props.sound.play(recordingTracksSounds[i], null, note, SoundOrigin.pianoRollNote)
            }
            this.props.dispatch(Actions.addPlayingNote(note))
        }
        return false;
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
        if(newFirstVisibleKey !== this.props.keyboard.firstKey){
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
            let ComposingCol = document.getElementById('ComposingCol');
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
            let firstVisibleKey = this.props.keyboard.firstKey;

            let currVisible = firstVisibleKey;
            let whiteKeysToRender = new Array;
            let blackKeysToRender = new Array;

            while (currVisible < 88 && keyboardWidths[currVisible].startWidth - keyboardWidths[firstVisibleKey].startWidth <= this.props.keyboard.width - 122) {
                if (keyboardWidths[currVisible].sharp) {
                    blackKeysToRender.push(
                        <BlackKey
                            key={currVisible}
                            note={currVisible}
                            margin={keyboardWidths[currVisible].startWidth - keyboardWidths[firstVisibleKey].startWidth}
                            handleMouseOver={this.handleDown.bind(this)}
                            handleMouseLeave={this.handleUp.bind(this)}
                            isPressed={this.props.keyboard.notesPlaying.includes(currVisible)}
                        />)
                } else {
                    whiteKeysToRender.push(
                        <WhiteKey
                            key={currVisible}
                            note={currVisible}
                            handleMouseOver={this.handleDown.bind(this)}
                            handleMouseLeave={this.handleUp.bind(this)}
                            isPressed={this.props.keyboard.notesPlaying.includes(currVisible)}
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
        sound: state.webAudio.sound
    }
}

export default connect(mapStateToProps)(Keyboard);