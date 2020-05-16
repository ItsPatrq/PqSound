import * as React from 'react';
import { Col, Grid, Row } from 'react-bootstrap';

import TopNavBar from 'containers/TopNavBar';
import ControlBar from 'containers/ControlBar';
import TrackDetails from 'containers/TrackDetails';
import TrackList from 'containers/TrackList';
import CompositionGrid from 'containers/CompositionGrid';
import Keyboard from 'containers/Keyboard';

const Layout = (/*props*/) => {
    return (
        <div className="layout">
            <TopNavBar />
            <Grid fluid style={{ overflow: 'hidden' }}>
                <Row>
                    <ControlBar />
                </Row>
                <Row>
                    <Col xs={2} className="nopadding" id="TrackDetailsCol">
                        <TrackDetails />
                    </Col>
                    <Col xs={10} className="nopadding" id="ComposingCol">
                        <TrackList />
                        <CompositionGrid />
                        <Col className="keyboard">
                            <Keyboard />
                        </Col>
                    </Col>
                </Row>
            </Grid>
        </div>
    );
};

export default Layout;
