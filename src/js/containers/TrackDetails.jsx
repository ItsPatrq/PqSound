import React from 'react';
import { Col, ButtonToolbar } from 'react-bootstrap';
import { connect } from 'react-redux';
import VolumeSlider from 'components/TrackDetails/VolumeSlider';
import PanKnob from 'components/TrackDetails/PanKnob';
import InstrumentInput from 'components/TrackDetails/InstrumentInput';
import PluginsList from 'components/TrackDetails/PluginsList';
import TrackName from 'components/TrackDetails/TrackName';
import Output from 'components/TrackDetails/Output';
import SoloMuteButtons from 'components/TrackDetails/SoloMuteButtons';
import * as Actions from 'actions/trackDetailsActions';
import { changeTrackPreset, changeTrackVolume, changeTrackInstrument, changeTrackOutput, changeSoloState, changeMuteState, changeTrackPan, addNewPlugin, removePlugin } from 'actions/trackListActions';
import { fetchSamplerInstrument } from 'actions/webAudioActions';
import * as Utils from 'engine/Utils';
import { TrackTypes } from 'constants/Constants';

class TrackDetails extends React.Component {
    constructor() {
        super();
    }

    getTrackName(index) {
        for (let i = 0; i < this.props.trackList.length; i++) {
            if (this.props.trackList[i].index === index) {
                return this.props.trackList[i].name;
            }
        }
    }

    getTrackInstrument(index) {
        for (let i = 0; i < this.props.trackList.length; i++) {
            if (this.props.trackList[i].index === index) {
                return this.props.trackList[i].instrument;
            }
        }
    }

    getTrackPreset(index) {
        for (let i = 0; i < this.props.trackList.length; i++) {
            if (this.props.trackList[i].index === index) {
                return this.props.trackList[i].instrument.preset;
            }
        }
    }

    instrumentModalVisibilitySwitch() {
        this.props.dispatch(Actions.instrumentModalVisibilitySwitch());
    }

    handleSamplerPresetChange(newPresetId) {
        if (this.getTrackPreset(this.props.selected).id !== newPresetId) {
            this.props.dispatch(changeTrackPreset(newPresetId, this.props.selected));
            for (let i = 0; i < this.props.samplerInstruments.length; i++) {
                if (this.props.samplerInstruments[i].id === newPresetId) {
                    if (!this.props.samplerInstruments[i].loaded) {
                        this.props.dispatch(fetchSamplerInstrument(newPresetId));
                    }
                    break;
                }
            }
        }
    }

    handleInstrumentChange(instrumentId) {
        if (instrumentId !== this.getTrackInstrument(this.props.selected).id) {
            this.props.dispatch(changeTrackInstrument(instrumentId, this.props.selected));
        }
    }

    onVolumeChange(index, newVolume) {
        let parsedNewVolume = parseInt(newVolume) / parseInt(100);
        if (!parsedNewVolume) {
            parsedNewVolume = 0.0001;
        }
        this.props.dispatch(changeTrackVolume(index, parsedNewVolume));
    }

    getAllAvailableAuxTracks() {
        let auxTrackList = new Array;
        for (let i = 0; i < this.props.trackList.length; i++) {
            if (this.props.trackList[i].trackType === TrackTypes.aux &&
                this.props.trackList[i].index !== this.props.selected) {
                auxTrackList.push(this.props.trackList[i])
            }
        }
        return auxTrackList;
    }

    getOutputName(trackIndex) {
        for (let i = 0; i < this.props.trackList.length; i++) {
            if (this.props.trackList[i].index === trackIndex) {
                return this.props.trackList[i].name;
            }
        }
    }

    handleOutputChange(outputIndex) {
        if (Utils.getTrackByIndex(this.props.trackList, this.props.selected).output !== outputIndex) {
            this.props.dispatch(changeTrackOutput(this.props.selected, outputIndex));
        }
    }

    handleSoloButtonClicked(index) {
        this.props.dispatch(changeSoloState(index));
    }

    handleMuteButtonClicked(index) {
        this.props.dispatch(changeMuteState(index));
    }

    getTypeNameByTrackId(trackId) {
        switch (Utils.getTrackByIndex(this.props.trackList, trackId).trackType) {
            case TrackTypes.virtualInstrument: {
                return 'Virtual Instrument';
            }
            case TrackTypes.aux: {
                return 'AUX';
            }
        }
    }

    handlePanChange(index, value) {
        if (value === 0) {
            value = 0.0000001
        }
        this.props.dispatch(changeTrackPan(index, value));
    }

    handleAddPlugin(trackIndex, pluginId){
        this.props.dispatch(addNewPlugin(trackIndex, pluginId));
    }

    handleRemovePlugin(trackIndex, pluginIndex){
        this.props.dispatch(removePlugin(trackIndex, pluginIndex));
    }

    render() {
        if (!!this.props.selected) {
            let instrumentComponent;
            if (Utils.getTrackByIndex(this.props.trackList, this.props.selected).trackType === TrackTypes.virtualInstrument) {
                instrumentComponent =
                    <InstrumentInput
                        instrumentModalVisibilitySwitch={this.instrumentModalVisibilitySwitch.bind(this)}
                        showModal={this.props.trackDetails.showInstrumentModal}
                        selectedTrack={Utils.getTrackByIndex(this.props.trackList, this.props.selected)}
                        onSamplerPresetChange={this.handleSamplerPresetChange.bind(this)}
                        onInstrumentChange={this.handleInstrumentChange.bind(this)}
                    />;
            } else {
                instrumentComponent =
                    <div className="instrumentInputContainer" />
            }
            return (
                <div>
                    <Col xs={6} className="trackDetailsContainer">
                        {instrumentComponent}
                        <PluginsList
                            pluginList={Utils.getTrackByIndex(this.props.trackList, this.props.selected).pluginList}
                            onPluginAdd={this.handleAddPlugin.bind(this)}
                            trackIndex={this.props.selected}
                            onPluginRemove={this.handleRemovePlugin.bind(this)}
                        />
                        <Output
                            auxTracks={this.getAllAvailableAuxTracks()}
                            dropDownTitle={this.getOutputName(Utils.getTrackByIndex(this.props.trackList, this.props.selected).output)}
                            onOutputChange={this.handleOutputChange.bind(this)}
                        />
                        <PanKnob
                            pan={Utils.getTrackByIndex(this.props.trackList, this.props.selected).pan}
                            onPanChange={this.handlePanChange.bind(this)}
                            trackIndex={this.props.selected}
                        />
                        <VolumeSlider
                            volume={Utils.getTrackByIndex(this.props.trackList, this.props.selected).volume}
                            onVolumeChange={this.onVolumeChange.bind(this)}
                            trackIndex={this.props.selected}
                            trackNode={Utils.getTrackByIndex(this.props.trackList, this.props.selected).trackNode}
                        />
                        <SoloMuteButtons
                            trackDetails={Utils.getTrackByIndex(this.props.trackList, this.props.selected)}
                            onSoloButtonClicked={this.handleSoloButtonClicked.bind(this)}
                            onMuteButtonClicked={this.handleMuteButtonClicked.bind(this)}
                        />
                        <TrackName name={this.getTrackName(this.props.selected)} />
                    </Col>
                    <Col xs={6} className="trackDetailsContainer">
                        <div className="instrumentInputContainer" />
                        <PluginsList
                            pluginList={Utils.getTrackByIndex(this.props.trackList, 0).pluginList}
                            onPluginAdd={this.handleAddPlugin.bind(this)}
                            trackIndex={0}
                            onPluginRemove={this.handleRemovePlugin.bind(this)}
                        />
                        <Output
                            auxTracks={[]}
                            dropDownTitle="Stereo out"
                        />
                        <PanKnob
                            pan={Utils.getTrackByIndex(this.props.trackList, 0).pan}
                            onPanChange={this.handlePanChange.bind(this)}
                            trackIndex={0}
                        />
                        <VolumeSlider
                            volume={Utils.getTrackByIndex(this.props.trackList, 0).volume}
                            onVolumeChange={this.onVolumeChange.bind(this)}
                            trackIndex={0}
                            trackNode={Utils.getTrackByIndex(this.props.trackList, 0).trackNode}
                        />
                        <SoloMuteButtons
                            trackDetails={Utils.getTrackByIndex(this.props.trackList, 0)}
                            onSoloButtonClicked={this.handleSoloButtonClicked.bind(this)}
                            onMuteButtonClicked={this.handleMuteButtonClicked.bind(this)}
                        />
                        <TrackName name={this.getTrackName(0)} />
                    </Col>
                </div>
            );
        }
        else {
            return (
                <div>
                    <Col xs={6} className="trackDetailsContainer">
                        <p>No track selected</p>
                    </Col>
                    <Col xs={6} className="trackDetailsContainer">
                        <ButtonToolbar className="instrumentInputContainer">
                        </ButtonToolbar>
                        <PluginsList
                            pluginList={Utils.getTrackByIndex(this.props.trackList, 0).pluginList}
                            onPluginAdd={this.handleAddPlugin.bind(this)}
                            trackIndex={0}
                            onPluginRemove={this.handleRemovePlugin.bind(this)}
                        />
                        <PanKnob />
                        <VolumeSlider
                            volume={Utils.getTrackByIndex(this.props.trackList, 0).volume}
                            onVolumeChange={this.onVolumeChange.bind(this)}
                            trackIndex={0}
                            trackNode={Utils.getTrackByIndex(this.props.trackList, 0).trackNode}
                        />
                        <SoloMuteButtons
                            trackDetails={Utils.getTrackByIndex(this.props.trackList, 0)}
                            onSoloButtonClicked={this.handleSoloButtonClicked.bind(this)}
                            onMuteButtonClicked={this.handleMuteButtonClicked.bind(this)}
                        />
                        <TrackName name={this.getTrackName(0)} />
                    </Col>
                </div>
            );
        }
    }
}

//REDUX connection
const mapStateToProps = (state) => {
    return {
        trackList: state.tracks.trackList,
        selected: state.tracks.selected,
        trackDetails: state.trackDetails,
        samplerInstruments: state.webAudio.samplerInstrumentsSounds.map(
            (value) => { return { name: value.name, loaded: value.loaded, id: value.id } }
        )
    }
}

export default connect(mapStateToProps)(TrackDetails);