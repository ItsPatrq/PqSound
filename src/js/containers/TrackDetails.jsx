import React from 'react';
import {Col} from 'react-bootstrap';

class TrackDetails extends React.Component {
    constructor() {
        super();
    }
    render() {
        return (
            <div>
                <Col xs={6} className="trackDetails nopadding">
                    track-details(current)
              </Col>
                <Col xs={6} className="trackDetails nopadding">
                    track-details(master)
              </Col>
            </div>
        );
    }
}

export default TrackDetails;