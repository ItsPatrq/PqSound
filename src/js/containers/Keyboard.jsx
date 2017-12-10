import React from 'react';
import Octave from 'components/Keyboard/Octave';
import { connect } from 'react-redux';
import { SoundOrigin, keyboardWidths } from 'constants/Constants';
import { isNullOrUndefined } from 'engine/Utils';
import * as Actions from 'actions/keyboardActions';
import WhiteKey from 'components/Keyboard/WhiteKey';
import BlackKey from 'components/Keyboard/BlackKey';

class Keyboard extends React.Component {
    constructor() {
        super();
        this.lastPressedKey = null;
        document.onmouseup = this.handleUp.bind(this);
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

    handleUp() {
        let recordingTracksSounds = this.getAllRecordingTracks();
        for (let i = 0; i < recordingTracksSounds.length; i++) {
            this.props.sound.stop(recordingTracksSounds[i], this.lastPressedKey)
        }
        this.lastPressedKey = null;
    }

    handleDown(note) {
        this.lastPressedKey = note;
        let recordingTracksSounds = this.getAllRecordingTracks();
        for (let i = 0; i < recordingTracksSounds.length; i++) {
            this.props.sound.play(recordingTracksSounds[i], null, note, SoundOrigin.pianoRollNote)
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
                this.props.dispatch(Actions.updateWidth(ComposingCol.offsetWidth));
            }
        }
    }

    render() {
        if (this.props.keyboard.show) {
            let renderOctaves = new Array;
            for (let i = 0; i < this.props.keyboard.octaves; i++) {
                renderOctaves.push(<Octave index={i} key={i.toString()} handleDown={this.handleDown.bind(this)} />);
            }
            let visibleWhiteKeys = Math.ceil(this.props.keyboard.width / 66);
            let firstVisibleKey = this.props.keyboard.firstKey
            while(firstVisibleKey + visibleWhiteKeys > 88 && firstVisibleKey >= 0){
                firstVisibleKey--;
            }
            let whiteKeysToRender = new Array;
            let blackKeysToRender = new Array;            
            for(let i = 0; i < visibleWhiteKeys; i++){
                whiteKeysToRender.push(<WhiteKey key={i}/>)
            }
            return (
                <div className="keyboardBody" ref={(input) => { this.Progress = input }}>
                    <div className="colorLine"></div>
                    {renderOctaves}
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