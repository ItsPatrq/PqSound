import React from 'react';
import PropTypes from 'prop-types';
import Track from './Pq.Ui.Track';
import Button from 'react-bootstrap/lib/Button';
import * as Utils from '../../engine/Pq.Utils';

require('styles/TrackList.css');

const TrackList = (props) => {
    let trackList = new Array;
    for (let i = 0; i < props.trackList.length; i++) {
        trackList.push(<Track key={i.toString()} index={i} trackDetails={props.trackList[i]} handleInputChange={()=>{}} />);
    }
    return (
        <div className="trackList">
            {trackList}
            <Button onClick={() => props.onModelChange(Utils.updateActions.add, trackList.length)}>Add new track!</Button>
        </div>
    );
}
TrackList.propTypes = {
    trackList: PropTypes.array.isRequired,
    onModelChange: PropTypes.func.isRequired
}
export default TrackList;