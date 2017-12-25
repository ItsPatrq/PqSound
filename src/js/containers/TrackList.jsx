import React from 'react';
import { connect } from 'react-redux';
import { Button, Glyphicon, Col } from 'react-bootstrap';
import Track from 'components/TrackList/Track';
import * as trackListActions from 'actions/trackListActions';
import * as compositionActions from 'actions/compositionActions';
import { fetchSamplerInstrument } from 'actions/webAudioActions';
import * as Utils from 'engine/Utils';
import AddNewTrackModal from 'components/TrackList/AddNewTrackModal';
import TrackListButtons from 'components/TrackList/TrackListButtons';

class TrackList extends React.Component {
    constructor() {
        super();
    }

    addTrack(trackType) {
        this.props.dispatch(trackListActions.addTrack(trackType));
    }

    removeTrack(index) {
        if (this.props.trackList.length > 2) {
            this.props.dispatch(trackListActions.removeTrack(index));
            this.props.dispatch(compositionActions.removeTrackFromComposition(index));
        }
    }

    handleRecordClick(index) {
        this.props.dispatch(trackListActions.changeRecordState(index));
        this.shouldFetchSamplerInstrument(index);
    }

    handleSoloButtonClicked(index) {
        this.props.dispatch(trackListActions.changeSoloState(index));
    }

    handleMuteButtonClicked(index) {
        this.props.dispatch(trackListActions.changeMuteState(index));
    }

    handleTrackNameChange(event, trackIndex) {
        this.props.dispatch(trackListActions.changeTrackName(event.target.value, trackIndex));
    }

    //Sprawdzanie czy wybrany jest sampler i czy ma załadowane sample TODO: zmienic nazwe tej metody?
    shouldFetchSamplerInstrument(index) {
        for (let i = 0; i < this.props.trackList.length; i++) {
            if (this.props.trackList[i].index === index &&
                this.props.trackList[i].instrument.name === 'Sampler') {
                for (let j = 0; j < this.props.samplerInstruments.length; j++) {
                    if (this.props.trackList[i].instrument.preset === this.props.samplerInstruments[j].name &&
                        !this.props.samplerInstruments[j].loaded && !this.props.fetching) {
                        this.props.dispatch(fetchSamplerInstrument(this.props.trackList[i].instrument.preset));
                    }
                }

            }
        }
    }

    changeSelectedTrack(index) {
        if (this.props.selected !== index) {
            this.props.dispatch(trackListActions.changeSelectedTrack(index));
        }
    }

    handleSwitchModalVisibility() {
        this.props.dispatch(trackListActions.addNewTrackModalVisibilitySwitch());

    }

    handleSoloAllClicked() {
        if (this.props.anyActive) {
            for (let i = 0; i < this.props.trackList.length; i++) {
                if (this.props.trackList[i].solo) {
                    this.handleSoloButtonClicked(this.props.trackList[i].index);
                }
            }
        } else {
            this.handleSoloButtonClicked(this.props.selected);
        }
    }

    handleIndexUp(index) {
        this.props.dispatch(trackListActions.trackIndexUp(index));
    }

    handleIndexDown(index) {
        this.props.dispatch(trackListActions.trackIndexDown(index));
    }

    render() {
        let renderTrackList = new Array;
        /**
         * start iteration from i = 1 because i = 0 is the master track
         */
        if (this.props.pianoRollVisible) {
            return null;
        } else {
            for (let i = 1; i < this.props.trackList.length; i++) {
                renderTrackList.push(
                    <Track key={i.toString()}
                        trackDetails={this.props.trackList[i]}
                        trackListLength={this.props.trackList.length}
                        onIndexUp={this.handleIndexUp.bind(this)}
                        onIndexDown={this.handleIndexDown.bind(this)}
                        handleRowClicked={this.changeSelectedTrack.bind(this)}
                        handleRemove={this.removeTrack.bind(this)}
                        onRecordButtonClicked={this.handleRecordClick.bind(this)}
                        onSoloButtonClicked={this.handleSoloButtonClicked.bind(this)}
                        onMuteButtonClicked={this.handleMuteButtonClicked.bind(this)}
                        handleTrackNameChange={this.handleTrackNameChange.bind(this)}
                        selected={this.props.selected}
                    />
                );
            }
            renderTrackList.sort((a, b) => { return a.props.trackDetails.index - b.props.trackDetails.index });
            return (
                <Col xs={2} className="trackList">
                    <TrackListButtons
                        onAddNewTrack={this.handleSwitchModalVisibility.bind(this)}
                        onSoloAllClicked={this.handleSoloAllClicked.bind(this)}
                        isAnySolo={this.props.anyActive}
                    />
                    <div className="trackListContent">
                        <div className="trackListContentList">
                            {renderTrackList}
                        </div>
                    </div>
                    <AddNewTrackModal
                        showModal={this.props.showModal}
                        modalVisibilitySwitch={this.handleSwitchModalVisibility.bind(this)}
                        onAddNewTrack={this.addTrack.bind(this)}
                    />
                </Col>
            );
        }
    }
}

//REDUX connection
const mapStateToProps = (state) => {
    let samplerInstruments = null;
    if (!Utils.isNullUndefinedOrEmpty(state.webAudio.samplerInstrumentsSounds)) {
        samplerInstruments = state.webAudio.samplerInstrumentsSounds.map(a => ({ 'name': a.name, 'loaded': a.loaded }));
    }
    return {
        trackList: state.tracks.trackList,
        selected: state.tracks.selected,
        anyActive: state.tracks.anyAuxSolo || state.tracks.anyVirtualInstrumentSolo,
        samplerInstruments: samplerInstruments,
        fetching: state.webAudio.fetching,
        showModal: state.tracks.showAddNewTrackModal,
        pianoRollVisible: state.composition.showPianoRoll
    }
}

export default connect(mapStateToProps)(TrackList);