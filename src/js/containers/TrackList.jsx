import React from 'react';
import { connect } from 'react-redux';
import { Button, Glyphicon } from 'react-bootstrap';
import Track from 'components/TrackList/Track';
import * as trackListActions from 'actions/trackListActions';
import { fetchSamplerInstrument, loadKeyboardSounds } from 'actions/webAudioActions';
import * as Utils from 'engine/Pq.Utils';

class TrackList extends React.Component {
    constructor() {
        super();
    }

    addTrack() {
        this.props.dispatch(trackListActions.addTrack());
    }

    removeTrack(index) {
        if (this.props.trackList.length > 1) {
            this.props.dispatch(trackListActions.removeTrack(index));
        }
    }

    handleRecordClick(index) {
        this.props.dispatch(trackListActions.changeRecordState(index));
        this.shouldFetchSamplerInstrument(index, true);
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

    render() {
        let renderTrackList = new Array;
        for (let i = 0; i < this.props.trackList.length; i++) {
            renderTrackList.push(
                <Track key={i.toString()}
                    trackDetails={this.props.trackList[i]}
                    handleRemove={this.removeTrack.bind(this)}
                    handleRecord={this.handleRecordClick.bind(this)}
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
        active: state.tracks.active,
        samplerInstruments: samplerInstruments,
        fetching: state.webAudio.fetching
    }
}

export default connect(mapStateToProps)(TrackList);