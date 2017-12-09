import React from 'react';
import { Col, Button, Glyphicon } from 'react-bootstrap';
import { connect } from 'react-redux';
import Sequencer from 'engine/Sequencer';
import * as actions from 'actions/controlActions';
import { changeBitsInComposition } from 'actions/compositionActions';
import BPMInput from 'components/ControlBar/BPMInput';
import ToolDropdown from 'components/ControlBar/ToolDropdown';
import NoteDrawLengthDropdown from 'components/ControlBar/NoteDrawLengthDropdown';
import RegionDrawLengthInput from 'components/ControlBar/RegionDrawLengthInput';
import BitsInCompositionInput from 'components/ControlBar/BitsInCompositionInput';

class ControlBar extends React.Component {
    constructor(props) {
        super();
        this.sequencer = new Sequencer();
        this.sequencer.init();
        this.state = {
            tempBPM: props.controlState.BPM,
            tempRegionDrawLength: props.controlState.regionDrawLength,
            tempBitsInComposition: props.bitsInComposition
        };
    }

    handlePlay() {
        if (!this.props.controlState.playing) {
            this.props.dispatch(actions.switchPlayState());
            this.sequencer.handlePlay();
        }
    }

    handleStop() {
        if (this.props.controlState.playing) {
            this.props.dispatch(actions.switchPlayState());
            this.sequencer.handleStop();
        }
    }

    handlePause() {
        if (this.props.controlState.playing) {
            this.props.dispatch(actions.switchPlayState());
            this.sequencer.handlePause();
        }
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

    handleBitsInCompositionChange() {
        //TODO: Delete regions on lowering bits in coposition
        if (this.state.tempBitsInComposition >= 48 && this.state.tempBitsInComposition <= this.props.maxBitsInComposition &&
            this.state.tempBitsInComposition !== this.props.bitsInComposition) {
            this.props.dispatch(changeBitsInComposition(this.state.tempBitsInComposition));
        } else {
            this.setState(() => { return { tempBitsInComposition: this.props.bitsInComposition }; });
        }
    }

    handleTempBitsInComposition(bitsInComposition) {
        this.setState(() => { return { tempBitsInComposition: bitsInComposition }; });
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
                    <BitsInCompositionInput id={'birsInComposition'} onBitsInCompositionChange={this.handleBitsInCompositionChange.bind(this)}
                        onTempBitsInCompositionChange={this.handleTempBitsInComposition.bind(this)} bitsInComposition={this.state.tempBitsInComposition}
                    />

                </Col>
                <center>
                    <p>
                        <Button onClick={this.handlePlay.bind(this)}><Glyphicon glyph="play" /></Button>
                        <Button onClick={this.handlePause.bind(this)}><Glyphicon glyph="pause" /></Button>
                        <Button onClick={this.handleStop.bind(this)}><Glyphicon glyph="stop" /></Button>
                        *Time Signature: 4/4* <br />
                        *currenttime={this.props.controlState.sixteenthNotePlaying * 0.25 * (60 / this.props.controlState.BPM)}*
                        *current note playing: {this.props.controlState.sixteenthNotePlaying}*
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
        showPianoRoll: state.composition.showPianoRoll,
        bitsInComposition: state.composition.bitsInComposition,
        maxBitsInComposition: state.composition.maxBitsInComposition
    }
}

export default connect(mapStateToProps)(ControlBar);