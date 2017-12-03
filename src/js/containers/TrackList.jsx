import React from 'react';
import { connect } from 'react-redux';
import { Button, Glyphicon } from 'react-bootstrap';
import Track from 'components/Track';
import * as trackListActions from 'actions/trackListActions';
import * as compositionActions from 'actions/compositionActions';
import { fetchSamplerInstrument } from 'actions/webAudioActions';
import * as Utils from 'engine/Utils';

class TrackList extends React.Component {
    constructor() {
        super();
    }

    addTrack() {
        this.props.dispatch(trackListActions.addTrack());
        this.props.dispatch(trackListActions.initTrackSound())
    }

    removeTrack(index) {
        if (this.props.trackList.length > 2) {
            this.props.dispatch(trackListActions.removeTrack(index));
            this.props.dispatch(compositionActions.removeTrackFromComposition(index));
        }
    }

    handleRecordClick(index) {
        this.props.dispatch(trackListActions.changeRecordState(index));
        this.shouldFetchSamplerInstrument(index, true);
    }

    handleTrackNameChange(event, trackIndex){
        this.props.dispatch(trackListActions.changeTrackName(event.target.value, trackIndex));
    }

    //Sprawdzanie czy wybrany jest sampler i czy ma załadowane sample TODO: zmienic nazwe tej metody?
    shouldFetchSamplerInstrument(index, shouldLoadToKeyboard) {
        for (let i = 0; i < this.props.trackList.length; i++) {
            if (this.props.trackList[i].index === index &&
                this.props.trackList[i].instrument.name === 'Sampler') {
                for (let j = 0; j < this.props.samplerInstruments.length; j++) {
                    if (this.props.trackList[i].instrument.preset === this.props.samplerInstruments[j].name &&
                        !this.props.samplerInstruments[j].loaded && !this.props.fetching) {
                            this.props.dispatch(fetchSamplerInstrument(this.props.trackList[i].instrument.preset, shouldLoadToKeyboard, this.props.trackList[i].volume));
                        }
                }

            }
        }
    }

    changeSelectedTrack(index) {
        if(this.props.selected !== index) {
            this.props.dispatch(trackListActions.changeSelectedTrack(index));
        }
    }

    render() {
        let renderTrackList = new Array;
        /**
         * start iteration from i = 1 because i = 0 is the master track
         */
        for (let i = 1; i < this.props.trackList.length; i++) {
            renderTrackList.push(
                <Track key={i.toString()}
                    trackDetails={this.props.trackList[i]}
                    handleRowClicked={this.changeSelectedTrack.bind(this)}
                    handleRemove={this.removeTrack.bind(this)}
                    handleRecord={this.handleRecordClick.bind(this)}
                    handleTrackNameChange={this.handleTrackNameChange.bind(this)}
                    selected={this.props.selected}
                />
            );
        }
        return (
            <div className=" trackList">
                <Button block={true} className="btn-block" bsStyle="primary" onClick={this.addTrack.bind(this)}><Glyphicon glyph="plus" /></Button>
                {renderTrackList}
            </div>
        );
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
        samplerInstruments: samplerInstruments,
        fetching: state.webAudio.fetching
    }
}

export default connect(mapStateToProps)(TrackList);