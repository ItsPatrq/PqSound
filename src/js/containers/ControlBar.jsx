import React from 'react';
import { Col, Button, Glyphicon } from 'react-bootstrap';
import { connect } from 'react-redux';
import Sequencer from 'engine/Sequencer';
import * as actions from 'actions/controlActions';
import BPMInput from 'components/controlBar/BPMInput';
import ToolDropdown from 'components/controlBar/ToolDropdown';
import NoteDrawLengthDropdown from 'components/controlBar/NoteDrawLengthDropdown';
import RegionDrawLengthInput from 'components/controlBar/RegionDrawLengthInput';

class ControlBar extends React.Component {
    constructor(props) {
        super();
        this.sequencer = new Sequencer();
        this.sequencer.init();
        this.state = {
            tempBPM: props.controlState.BPM,
            tempRegionDrawLength: props.controlState.regionDrawLength
        };
    }

    handlePlay() {
        this.sequencer.handlePlay();
    }

    handleStop() {
        this.sequencer.handleStop();
    }

    handleTempBPMChange(BPM) {
        this.setState(() => { return { tempBPM: BPM }; });
    }

    handleBPMChange() {
        if (this.state.tempBPM >= this.props.controlState.minBPM && this.state.tempBPM <= this.props.controlState.maxBPM &&
            this.state.tempBPM !== this.props.controlState.BPM) {
            this.props.dispatch(actions.changeBPM(this.state.tempBPM));
        } else {
            this.setState(() => { return { tempBPM: this.props.controlState.BPM }; });
        }
    }

    handleToolChange(tool) {
        if (tool !== this.props.controlState.tool)
            this.props.dispatch(actions.changeTool(tool));
    }

    handleNoteDrawLengthChange(length) {
        if (length !== this.props.controlState.noteDrawLength) {
            this.props.dispatch(actions.changeNoteDrawLength(length));
        }
    }

    handleRegionDrawLengthChange() {
        if (this.state.tempRegionDrawLength >= 1 && this.state.tempRegionDrawLength <= this.props.controlState.maxRegionDrawLength &&
            this.state.tempRegionDrawLength !== this.props.controlState.regionDrawLength) {
            this.props.dispatch(actions.changeRegionDrawLength(this.state.tempRegionDrawLength));
        } else {
            this.setState(() => { return { tempRegionDrawLength: this.props.controlState.regionDrawLength }; });
        }
    }

    handleTempRegionDrawLengthChange(regionDrawLength) {
        this.setState(() => { return { tempRegionDrawLength: regionDrawLength }; });
    }

    render() {
        return (
            <Col xs={12} className="nopadding infoBar">
                <Col xs={3}>
                    BPM:
                        <BPMInput changeBPM={this.handleBPMChange.bind(this)} changeTempBPM={this.handleTempBPMChange.bind(this)} BPM={this.state.tempBPM} />
                </Col>
                <Col xs={3}>
                    <ToolDropdown id={'leftClickTools'} onToolChange={this.handleToolChange.bind(this)} />
                    <NoteDrawLengthDropdown id={'noteDrawLength'} isVisible={this.props.showPianoRoll} onNoteDrawLengthChange={this.handleNoteDrawLengthChange.bind(this)} />
                    <RegionDrawLengthInput id={'regionDrawLength'} isVisible={!this.props.showPianoRoll}
                        regionDrawLength={this.state.tempRegionDrawLength} onRegionDrawLengthChange={this.handleRegionDrawLengthChange.bind(this)}
                        onTempRegionDrawLengthChange={this.handleTempRegionDrawLengthChange.bind(this)}
                    />
                </Col>
                <center>
                    <p>
                        <Button onClick={this.handlePlay.bind(this)}><Glyphicon glyph="play" /></Button>
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
        controlState: state.control,
        showPianoRoll: state.composition.showPianoRoll
    }
}

export default connect(mapStateToProps)(ControlBar);