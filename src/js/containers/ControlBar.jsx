import React from 'react';
import { Col, Button, Glyphicon } from 'react-bootstrap';
import Sequencer from 'engine/Sequencer';

class ControlBar extends React.Component {
    constructor() {
        super();
        this.sequencer = new Sequencer;
    }

    handlePlay(){
        this.sequencer.handlePlay();
    }

    handleStop(){
        this.sequencer.handleStop();
    }

    render() {
        return (
            <Col xs={12} className="nopadding infoBar">
                <center>
                    <p>
                        <Button><Glyphicon glyph="play" onClick={this.handlePlay.bind(this)}/></Button>
                        <Button><Glyphicon glyph="pause" /></Button>
                        <Button><Glyphicon glyph="stop" onClick={this.handleStop.bind(this)}/></Button>
                        *BPM:120* *Time Signature: 4/4* *currenttime=xxx*
                    </p>
                </center>
            </Col>
        );
    }
}

export default ControlBar;