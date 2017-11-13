import React from 'react';
import PropTypes from 'prop-types';
import Track from './TrackComponent';

require('styles/TrackList.css');

const TrackList = (props) => {
    let trackList = new Array;
    for (let i = 0; i < props.trackList.length; i++) {
        trackList.push(<Track key={i.toString()} index={i} trackDetails={props.trackList[i]} handleInputChange={()=>{}} />);
    }
    return (
        <div className="trackList">
            {trackList}
        </div>
    );
}
TrackList.propTypes = {
    trackList: PropTypes.array.isRequired
}
export default TrackList;