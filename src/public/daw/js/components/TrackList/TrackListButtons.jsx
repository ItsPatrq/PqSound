import * as React from 'react';
import { Button } from 'react-bootstrap';
import { Plus } from 'react-bootstrap-icons';

const TrackListButtons = (props) => {
    return (
        <div className="trackListButtons">
            <Button variant="primary" onClick={props.onAddNewTrack}>
                <Plus />
            </Button>
            <Button variant={props.isAnySolo ? 'warning' : 'secondary'} onClick={props.onSoloAllClicked}>
                S
            </Button>
        </div>
    );
};

export default TrackListButtons;
