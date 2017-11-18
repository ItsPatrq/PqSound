import React from 'react';
import {Col} from 'react-bootstrap';

class TopInfoBar extends React.Component {
    constructor(){
        super();
    }
    render() {
        return (
            <Col xs={12} className="nopadding infoBar">
              <center><p>Top info bar: *start* *stop* *BPM:120* *itp*</p></center>
            </Col>
        );
    }
}

export default TopInfoBar;