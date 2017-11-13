import React from 'react';
import PropTypes from 'prop-types';

const Track = (props) => {
    return (
        <div className="trackRow">
            <p className="text">Name: {props.trackDetails.name}</p>
            <p className="text">Volume: {props.trackDetails.volume}</p>
            <input
                type="range"
                min="0" max="100"
                value={props.trackDetails.volume}
                onChange={props.handleInputChange}/>

        </div>
    );
}
Track.propTypes = {
    index: PropTypes.number.isRequired,
    trackDetails: PropTypes.object.isRequired
}

export default Track;