import React from 'react';
import { Button, Glyphicon } from 'react-bootstrap';
import { TrackTypes } from 'constants/Constants';

const TrackListButtons = (props) => {
    return (
        <div className="trackListButtons">
            <Button
                bsStyle="primary"
                onClick={props.onAddNewTrack}>
                <Glyphicon glyph="plus" />
            </Button>
            <Button
                bsStyle={props.isAnySolo? 'warning' : 'default'}
                onClick={props.onSoloAllClicked}>
                S
            </Button>
        </div>
    );
}

export default TrackListButtons;