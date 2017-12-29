import React from 'react';
import { Col, Button, Glyphicon } from 'react-bootstrap';
import { connect } from 'react-redux';
import Sequencer from 'engine/Sequencer';
import * as Actions from 'actions/controlActions';
import { changeBarsInComposition } from 'actions/compositionActions';
import ToolsSelector from 'components/ControlBar/ToolsSelector';
import ProjectInfoBox from 'components/ControlBar/ProjectInfoBox';
import MIDIDeviceSelector from 'components/ControlBar/MIDIDeviceSelector';
import { isNullOrUndefined } from 'engine/Utils';

class ControlBar extends React.Component {
    constructor(props) {
        super();
        let sequencer = new Sequencer();
        sequencer.init();
        props.dispatch(Actions.initSequencer(sequencer))
        this.state = {
            tempBPM: props.controlState.BPM,
            tempRegionDrawLength: props.controlState.regionDrawLength,
            tempBarsInComposition: props.barsInComposition
        };
    }

    handlePlay() {
        if (!this.props.controlState.playing) {
            this.props.dispatch(Actions.switchPlayState());
            this.props.controlState.sequencer.handlePlay();
        }
    }

    handleStop() {
        if (this.props.controlState.playing) {
            this.props.dispatch(Actions.switchPlayState());
        }
        this.props.controlState.sequencer.handleStop();
    }

    handlePause() {
        if (this.props.controlState.playing) {
            this.props.dispatch(Actions.switchPlayState());
            this.props.controlState.sequencer.handlePause();
        }
    }

    handleTempBPMChange(BPM) {
        this.setState(() => { return { tempBPM: BPM }; });
    }

    handleBPMChange() {
        if (this.state.tempBPM >= this.props.controlState.minBPM && this.state.tempBPM <= this.props.controlState.maxBPM &&
            this.state.tempBPM !== this.props.controlState.BPM) {
            this.props.dispatch(Actions.changeBPM(this.state.tempBPM));
        } else {
            this.setState(() => { return { tempBPM: this.props.controlState.BPM }; });
        }
    }

    handleToolChange(tool) {
        if (tool !== this.props.controlState.tool)
            this.props.dispatch(Actions.changeTool(tool));
    }

    handleSecoundaryToolChange(tool) {
        if (tool !== this.props.controlState.secoundaryTool)
            this.props.dispatch(Actions.changeSecoundaryTool(tool));
    }

    handleNoteDrawLengthChange(length) {
        if (length !== this.props.controlState.noteDrawLength) {
            this.props.dispatch(Actions.changeNoteDrawLength(length));
        }
    }

    handleRegionDrawLengthChange() {
        if (this.state.tempRegionDrawLength >= 1 && this.state.tempRegionDrawLength <= this.props.controlState.maxRegionDrawLength &&
            this.state.tempRegionDrawLength !== this.props.controlState.regionDrawLength) {
            this.props.dispatch(Actions.changeRegionDrawLength(this.state.tempRegionDrawLength));
        } else {
            this.setState(() => { return { tempRegionDrawLength: this.props.controlState.regionDrawLength }; });
        }
    }

    handleTempRegionDrawLengthChange(regionDrawLength) {
        this.setState(() => { return { tempRegionDrawLength: regionDrawLength }; });
    }

    handleBarsInCompositionChange() {
        //TODO: Delete regions on lowering bits in coposition
        if (this.state.tempBarsInComposition >= 48 && this.state.tempBarsInComposition <= this.props.maxBarsInComposition &&
            this.state.tempBarsInComposition !== this.props.BarsInComposition) {
            this.props.dispatch(changeBarsInComposition(this.state.tempBarsInComposition));
        } else {
            this.setState(() => { return { tempBarsInComposition: this.props.barsInComposition }; });
        }
    }

    handleTempBarsInComposition(barsInComposition) {
        this.setState(() => { return { tempBarsInComposition: barsInComposition }; });
    }

    getMIDIDeviceSelectorDropDownTitle() {
        if (this.props.controlState.midiController.MIDISupported) {
            if (this.props.controlState.midiController.devices.input.length > 0) {
                if (isNullOrUndefined(this.props.controlState.midiController.selectedInputDevice)) {
                    return 'No device selected'
                } else {
                    return this.props.controlState.midiController.selectedInputDevice.name;
                }
            } else {
                return 'No devices detected';
            }
        } else {
            return 'Web MIDI Api not supported';
        }
    }

    handleDeviceChange(deviceId) {
        if (!(deviceId === null && isNullOrUndefined(this.props.controlState.midiController.selectedInputDevice)) &&
            (isNullOrUndefined(this.props.controlState.midiController.selectedInputDevice) ||
                deviceId !== this.props.controlState.midiController.selectedInputDevice.id)) {
            this.props.dispatch(Actions.changeMidiDevice(deviceId));
        }
    }

    render() {
        return (
            <Col xs={12} className="controlBar">
                <Col xs={2}>
                    <MIDIDeviceSelector
                        devices={this.props.controlState.midiController.devices.input}
                        dropDownTitle={this.getMIDIDeviceSelectorDropDownTitle()}
                        onDeviceChange={this.handleDeviceChange.bind(this)}
                    />
                </Col>
                <Col xs={3}>
                    <ToolsSelector
                        handleToolChange={this.handleToolChange.bind(this)}
                        handleSecoundaryToolChange={this.handleSecoundaryToolChange.bind(this)}
                        pianoRollVIsible={this.props.showPianoRoll}
                        hangleNoteDrawLengthChange={this.handleNoteDrawLengthChange.bind(this)}
                        regionDrawLength={this.state.tempRegionDrawLength}
                        handleRegionDrawLengthChange={this.handleRegionDrawLengthChange.bind(this)}
                        handleTempRegionDrawLengthChange={this.handleTempRegionDrawLengthChange.bind(this)}
                        tool={this.props.controlState.tool}
                        secoundaryTool={this.props.controlState.secoundaryTool}
                    />
                </Col>
                <div style={{ width: 41.666667 + '%' }}>
                    <ProjectInfoBox
                        changeBPM={this.handleBPMChange.bind(this)}
                        changeTempBPM={this.handleTempBPMChange.bind(this)}
                        BPM={this.state.tempBPM}
                        currSixteenth={this.props.controlState.sixteenthNotePlaying}
                        onBarsInCompositionChange={this.handleBarsInCompositionChange.bind(this)}
                        onTempBarsInCompositionChange={this.handleTempBarsInComposition.bind(this)}
                        barsInComposition={this.state.tempBarsInComposition}
                    />
                </div>
                <Col xs={2} className="controlButtons">
                    <Button onClick={this.handlePlay.bind(this)}><Glyphicon glyph="play" /></Button>
                    <Button onClick={this.handlePause.bind(this)}><Glyphicon glyph="pause" /></Button>
                    <Button onClick={this.handleStop.bind(this)}><Glyphicon glyph="stop" /></Button>
                </Col>
            </Col>
        );
    }
}

//REDUX connection
const mapStateToProps = (state) => {
    return {
        controlState: state.control,
        showPianoRoll: state.composition.showPianoRoll,
        barsInComposition: state.composition.barsInComposition,
        maxBarsInComposition: state.composition.maxBarsInComposition
    }
}

export default connect(mapStateToProps)(ControlBar);