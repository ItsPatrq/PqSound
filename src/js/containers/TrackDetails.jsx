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
                return this.props.trackList[i].instrument.name;
            }
        }
    }

    instrumentModalVisibilitySwitch() {
        this.props.dispatch(Actions.instrumentModalVisibilitySwitch());
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
                        />
                        <PluginsList />
                        <PanKnob />
                        <VolumeSlider />
                        <SoloMuteButtons />
                        <TrackName name={this.getTrackName(this.props.selected)} />
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
        trackDetails: state.trackDetails
    }
}

export default connect(mapStateToProps)(TrackDetails);