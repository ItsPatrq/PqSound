import React from 'react';
import { Col, Button, Glyphicon, FormControl } from 'react-bootstrap';
import { connect } from 'react-redux';
import Sequencer from 'engine/Sequencer';
import * as actions from 'actions/controlActions';

class ControlBar extends React.Component {
    constructor() {
        super();
        this.sequencer = new Sequencer();
        this.sequencer.init();
    }

    handlePlay() {
        console.log("Handle play control");                
        this.sequencer.handlePlay();
    }

    handleStop() {
        this.sequencer.handleStop();
    }

    handleBPMChange(event) {
        this.props.dispatch(actions.changeBPM(event.target.value));
    }

    render() {
        return (
            <Col xs={12} className="nopadding infoBar">
                <center>
                    <p>
                        <FormControl bsSize="sm" value={this.props.BPM} onChange={this.handleBPMChange.bind(this)} />
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
        BPM: state.control.BPM
    }
}

export default connect(mapStateToProps)(ControlBar);