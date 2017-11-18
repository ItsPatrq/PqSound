import React from 'react';
import { Col, Grid, Row } from 'react-bootstrap';

import TopNavBar from 'containers/TopNavBar';
import TopInfoBar from 'containers/TopInfoBar';
import TrackDetails from 'containers/TrackDetails';
import TrackList from 'containers/TrackList';
import CompositionGrid from 'containers/CompositionGrid';
import Keyboard from 'containers/Keyboard';

const Layout = (/*props*/) => {
    return (
        <div className="layout">
            <TopNavBar />
            <Grid fluid>
                <Row>
                    <TopInfoBar />
                </Row>
                <Row>
                    <Col xs={2} className="nopadding">
                        <TrackDetails />
                    </Col>
                    <Col xs={10} className="nopadding">
                        <Col xs={2} className="nopadding">
                            <TrackList />
                        </Col>
                        <Col xs={10} className="nopadding">
                            <CompositionGrid />
                        </Col>
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