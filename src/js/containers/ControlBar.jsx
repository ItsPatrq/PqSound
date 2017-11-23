import React from 'react';
import { Col, Button, Glyphicon } from 'react-bootstrap';
import { connect } from 'react-redux';
import Sequencer from 'engine/Sequencer';
import * as actions from 'actions/controlActions';
import BPMInput from 'components/controlBar/BPMInput';

class ControlBar extends React.Component {
    constructor(props) {
        super();
        this.sequencer = new Sequencer();
        this.sequencer.init();
        this.state = {
            tempBPM: props.BPM
        };
    }

    handlePlay() {
        this.sequencer.handlePlay();
    }

    handleStop() {
        this.sequencer.handleStop();
    }

    handleTempBPMChange(value) {
        this.setState(() => { return { tempBPM: value }; });
    }

    handleBPMChange() {
        if (this.state.tempBPM >= this.props.minBPM && this.state.tempBPM <= this.props.maxBPM &&
            this.state.tempBPM !== this.props.BPM) {
            this.props.dispatch(actions.changeBPM(this.state.tempBPM));
        }
    }

    render() {
        return (
            <Col xs={12} className="nopadding infoBar">
                <Col xs={3}>
                    BPM:
                        <BPMInput changeBPM={this.handleBPMChange.bind(this)} changeTempBPM={this.handleTempBPMChange.bind(this)} BPM={this.state.tempBPM} />
                </Col>
                <center>
                    <p>
                        <Button><Glyphicon glyph="play" onClick={this.handlePlay.bind(this)} /></Button>
                        <Button><Glyphicon glyph="pause" /></Button>
                        <Button><Glyphicon glyph="stop" onClick={this.handleStop.bind(this)} /></Button>
                        *Time Signature: 4/4* *currenttime=xxx*
                    </p>
                </center>
            </Col>
        );
    }
}

//REDUX connection
const mapStateToProps = (state) => {
    return {
        BPM: state.control.BPM,
        minBPM: state.control.minBPM,
        maxBPM: state.control.maxBPM
    }
}

export default connect(mapStateToProps)(ControlBar);