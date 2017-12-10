import React from 'react';
import { Col, ButtonToolbar } from 'react-bootstrap';
import { connect } from 'react-redux';
import VolumeSlider from 'components/TrackDetails/VolumeSlider';
import PanKnob from 'components/TrackDetails/PanKnob';
import InstrumentInput from 'components/TrackDetails/InstrumentInput';
import PluginsList from 'components/TrackDetails/PluginsList';
import TrackName from 'components/TrackDetails/TrackName';
import SoloMuteButtons from 'components/TrackDetails/SoloMuteButtons';
import * as Actions from 'actions/trackDetailsActions';
import { changeTrackPreset, changeTrackVolume, changeTrackInstrument } from 'actions/trackListActions';
import { fetchSamplerInstrument } from 'actions/webAudioActions';
import * as Utils from 'engine/Utils';

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
        if(instrumentId !== this.getTrackInstrument(this.props.selected).id){
            this.props.dispatch(changeTrackInstrument(instrumentId, this.props.selected));
        }
    }

    onVolumeChange(index, newVolume) {
        let parsedNewVolume = parseInt(newVolume) / parseInt(100);
        if(!parsedNewVolume){
            parsedNewVolume = 0.0001;
        }
        this.props.dispatch(changeTrackVolume(index, parsedNewVolume));
    }

    render() {
        if (!!this.props.selected) {
            return (
                <div>
                    <Col xs={6} className="trackDetails">
                        <InstrumentInput
                            instrumentModalVisibilitySwitch={this.instrumentModalVisibilitySwitch.bind(this)}
                            showModal={this.props.trackDetails.showInstrumentModal}
                            selectedTrack={Utils.getTrackByIndex(this.props.trackList, this.props.selected)}
                            onSamplerPresetChange={this.handleSamplerPresetChange.bind(this)}
                            onInstrumentChange={this.handleInstrumentChange.bind(this)}
                        />
                        <PluginsList />
                        <PanKnob />
                        <VolumeSlider
                            volume={Utils.getTrackByIndex(this.props.trackList, this.props.selected).volume}
                            onVolumeChange={this.onVolumeChange.bind(this)}
                            trackIndex={this.props.selected}
                        />
                        <SoloMuteButtons />
                        <TrackName name={this.getTrackName(this.props.selected)} />
                    </Col>
                    <Col xs={6} className="trackDetails">
                        <ButtonToolbar className="instrumentInput">
                            <p>wolna przestrzeń ;c </p>
                        </ButtonToolbar>
                        <PluginsList />
                        <PanKnob />
                        <VolumeSlider
                            volume={Utils.getTrackByIndex(this.props.trackList, 0).volume}
                            onVolumeChange={this.onVolumeChange.bind(this)}
                            trackIndex={0}
                        />
                        <SoloMuteButtons />
                        <TrackName name={this.getTrackName(0)} />
                    </Col>
                </div>
            );
        }
        else {
            return (
                <div>
                    <Col xs={6} className="trackDetails">
                        <p>No track selected</p>
                    </Col>
                    <Col xs={6} className="trackDetails">
                        <ButtonToolbar className="instrumentInput">
                            <p>wolna przestrzeń ;c </p>
                        </ButtonToolbar>
                        <PluginsList />
                        <PanKnob />
                        <VolumeSlider />
                        <SoloMuteButtons />
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
        ),
        sound: state.webAudio.sound
    }
}

export default connect(mapStateToProps)(TrackDetails);