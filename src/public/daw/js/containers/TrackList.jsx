import * as React from 'react';
import { connect } from 'react-redux';
import { Col } from 'react-bootstrap';
import Track from 'components/TrackList/Track';
import * as trackListActions from 'actions/trackListActions';
import * as compositionActions from 'actions/compositionActions';
import { fetchSamplerInstrument } from 'actions/webAudioActions';
import * as Utils from 'engine/Utils';
import AddNewTrackModal from 'components/TrackList/AddNewTrackModal';
import TrackListButtons from 'components/TrackList/TrackListButtons';
import { textInputFocusedSwitch } from 'actions/controlActions';

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
        const currTrack = Utils.getTrackByIndex(this.props.trackList, index);
        if (!currTrack.record) {
            currTrack.instrument.stopAll();
        }
    }

    handleSoloButtonClicked(index) {
        this.props.dispatch(trackListActions.changeSoloState(index));
    }

    handleMuteButtonClicked(index) {
        this.props.dispatch(trackListActions.changeMuteState(index));
    }

    handleTrackNameChange(event, trackIndex) {
        if (event.target.value.length > 0) {
            this.props.dispatch(trackListActions.changeTrackName(event.target.value, trackIndex));
        }
    }

    //Sprawdzanie czy wybrany jest sampler i czy ma załadowane sample TODO: zmienic nazwe tej metody?
    shouldFetchSamplerInstrument(index) {
        for (let i = 0; i < this.props.trackList.length; i++) {
            if (this.props.trackList[i].index === index && this.props.trackList[i].instrument.name === 'Sampler') {
                for (let j = 0; j < this.props.samplerInstruments.length; j++) {
                    if (
                        this.props.trackList[i].instrument.preset === this.props.samplerInstruments[j].name &&
                        !this.props.samplerInstruments[j].loaded &&
                        !this.props.samplerInstruments[j].fetching
                    ) {
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
        if (this.props.selected === index) {
            this.props.dispatch(trackListActions.changeSelectedTrack(index + 1));
        } else if (this.props.selected === index + 1) {
            this.props.dispatch(trackListActions.changeSelectedTrack(index));
        }
        this.props.dispatch(compositionActions.trackIndexUp(index));
        this.props.dispatch(trackListActions.trackIndexUp(index));
    }

    handleIndexDown(index) {
        if (this.props.selected === index) {
            this.props.dispatch(trackListActions.changeSelectedTrack(index - 1));
        } else if (this.props.selected === index - 1) {
            this.props.dispatch(trackListActions.changeSelectedTrack(index));
        }
        this.props.dispatch(compositionActions.trackIndexDown(index));
        this.props.dispatch(trackListActions.trackIndexDown(index));
    }

    /**
     * For not playing on virtual keyboard while inputing text
     */
    handleInputFocusSwitch() {
        this.props.dispatch(textInputFocusedSwitch());
    }

    render() {
        const renderTrackList = [];
        /**
         * start iteration from i = 1 because i = 0 is the master track
         */
        if (this.props.pianoRollVisible) {
            return null;
        } else {
            for (let i = 1; i < this.props.trackList.length; i++) {
                renderTrackList.push(
                    <Track
                        key={i.toString()}
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
                        onInputFocusSwitch={this.handleInputFocusSwitch.bind(this)}
                    />,
                );
            }
            renderTrackList.sort((a, b) => {
                return a.props.trackDetails.index - b.props.trackDetails.index;
            });
            return (
                <Col xs={2} className="trackList">
                    <TrackListButtons
                        onAddNewTrack={this.handleSwitchModalVisibility.bind(this)}
                        onSoloAllClicked={this.handleSoloAllClicked.bind(this)}
                        isAnySolo={this.props.anyActive}
                    />
                    <div className="trackListContent">
                        <div className="trackListContentList">{renderTrackList}</div>
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
        samplerInstruments = state.webAudio.samplerInstrumentsSounds.map((a) => ({ name: a.name, loaded: a.loaded }));
    }
    return {
        trackList: state.tracks.trackList,
        selected: state.tracks.selected,
        anyActive: state.tracks.anyAuxSolo || state.tracks.anyVirtualInstrumentSolo,
        samplerInstruments: samplerInstruments,
        showModal: state.tracks.showAddNewTrackModal,
        pianoRollVisible: state.composition.showPianoRoll,
    };
};

export default connect(mapStateToProps)(TrackList);
