import React from 'react';
import {Col} from 'react-bootstrap';

class ControlBar extends React.Component {
    constructor(){
        super();
    }
    render() {
        return (
            <Col xs={12} className="nopadding infoBar">
              <center><p>Top info bar: *start* *stop* *BPM:120* *Time Signature: 4/4*</p></center>
            </Col>
        );
    }
}

export default ControlBar;