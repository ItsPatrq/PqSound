import React from 'react';
import Octave from 'components/Keyboard/Octave';
import { connect } from 'react-redux';

class Keyboard extends React.Component {
    constructor() {
        super();
        this.lastPressedKey = null;

        document.onmouseup = this.handleUp.bind(this);
    }

    getAllRecordingTracks(){
        let recordingTracksSounds = new Array;
        for(let i = 1; i < this.props.trackList.length; i++){
            if(this.props.trackList[i].record){
                recordingTracksSounds.push(this.props.trackList[i].sound);
            }
        }
        return recordingTracksSounds;
    }

    handleUp() {
        // if (this.lastPressedKey !== null) {
        //     this.props.keysSounds[this.lastPressedKey].stop();
        //     this.lastPressedKey = null;
        // }
    }

    handleDown(note) {
        this.lastPressedKey = note;
        let recordingTracksSounds = this.getAllRecordingTracks();
        for(let i = 0; i < recordingTracksSounds.length; i++){
            recordingTracksSounds[i].play(null, note);
        }
    }

    render() {
        if (this.props.keyboard.show) {
            var renderOctaves = new Array;
            for (var i = 0; i < this.props.keyboard.octaves; i++) {
                renderOctaves.push(<Octave index={i} key={i.toString()} handleDown={this.handleDown.bind(this)} />);
            }
            return (
                <div className="keyboardBody">
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
        trackList: state.tracks.trackList
    }
}

export default connect(mapStateToProps)(Keyboard);