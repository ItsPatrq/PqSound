import React from 'react';
import { connect } from 'react-redux';
import { Button, Glyphicon } from 'react-bootstrap';
import Track from 'components/TrackList/Track';
import * as Actions from 'actions/trackListActions'

class TrackList extends React.Component {
    constructor() {
        super();
    }

    addTrack() {
        this.props.dispatch(Actions.addTrack());
    }

    removeTrack(index) {
        if(this.props.trackList.length > 1){
            this.props.dispatch(Actions.removeTrack(index));
        }
    }

    handleRecordClick(index){
        this.props.dispatch(Actions.changeRecordState(index));
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
    return {
        trackList: state.tracks.trackList,
        active: state.tracks.active
    }
}

export default connect(mapStateToProps)(TrackList);