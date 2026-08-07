import * as React from 'react';

import Header from 'containers/Header';
import Footer from 'containers/Footer';
import ViewBar from 'containers/ViewBar';
import TrackDetails from 'containers/TrackDetails';
import TrackList from 'containers/TrackList';
import InstrumentPanel from 'containers/InstrumentPanel';
import FxPanel from 'containers/FxPanel';
import CompositionGrid from 'containers/CompositionGrid';
import Keyboard from 'containers/Keyboard';
import Mixer from 'containers/Mixer';

const Layout = () => {
    return (
        <div className="layout pq-app pq-shell">
            <Header />
            <div className="pq-body-wrap">
                {/* id kept for Keyboard/Header/Footer width measurement (they read
                    getElementById('ComposingCol').offsetWidth to size the keyboard). */}
                <div className="pq-body" id="ComposingCol">
                    <TrackList />
                    <InstrumentPanel />
                    <CompositionGrid />
                    <FxPanel />
                    <div className="pq-channel-col" id="ChannelCol">
                        <TrackDetails />
                    </div>
                </div>
                {/* Mixer is a full-width bottom overlay over the body (like the keyboard):
                    it docks to the bottom of the body region and doesn't reach the top.
                    Renders null when not toggled. */}
                <Mixer />
            </div>
            <ViewBar />
            <Footer />
            {/* Keyboard is the very bottom row (below the view bar + footer), not an
                overlay — its own grid row that collapses to 0 when Keyboard renders null. */}
            <div className="keyboard">
                <Keyboard />
            </div>
        </div>
    );
};

export default Layout;
