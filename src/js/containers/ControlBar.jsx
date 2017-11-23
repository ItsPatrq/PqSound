import React from 'react';
import { Col, Button, Glyphicon } from 'react-bootstrap';
import { connect } from 'react-redux';
import Sequencer from 'engine/Sequencer';
import * as actions from 'actions/controlActions';
import BPMInput from 'components/controlBar/BPMInput';
import ToolDropdown from 'components/controlBar/ToolDropdown';

class ControlBar extends React.Component {
    constructor(props) {
        super();
        this.sequencer = new Sequencer();
        this.sequencer.init();
        this.state = {
            tempBPM: props.controlState.BPM
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
        if (this.state.tempBPM >= this.props.controlState.minBPM && this.state.tempBPM <= this.props.controlState.maxBPM &&
            this.state.tempBPM !== this.props.controlState.BPM) {
            this.props.dispatch(actions.changeBPM(this.state.tempBPM));
        } else {
            this.setState(() => { return { tempBPM: this.props.controlState.BPM }; });
        }
    }

    handleToolChange(tool){
        if(tool !== this.props.controlState.tool)
        this.props.dispatch(actions.changeTool(tool));
    }

    render() {
        return (
            <Col xs={12} className="nopadding infoBar">
                <Col xs={3}>
                    BPM:
                        <BPMInput changeBPM={this.handleBPMChange.bind(this)} changeTempBPM={this.handleTempBPMChange.bind(this)} BPM={this.state.tempBPM} />
                </Col>
                <Col xs={3}>
                    <ToolDropdown id={'leftClickTools'} onToolChange={this.handleToolChange.bind(this)}/>
                </Col>
                <center>
                    <p>
                        <Button onClick={this.handlePlay.bind(this)}><Glyphicon glyph="play"/></Button>
                        <Button><Glyphicon glyph="pause" /></Button>
                        <Button onClick={this.handleStop.bind(this)}><Glyphicon glyph="stop" /></Button>
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
        controlState: state.control
    }
}

export default connect(mapStateToProps)(ControlBar);