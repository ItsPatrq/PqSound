import * as React from 'react';
import Layout from 'components/Layout';
import { connect } from 'react-redux';
import { initializeWebAudio, fetchSamplerInstrument } from 'actions/webAudioActions';
import { initInstrumentContext } from 'actions/trackListActions';
import { initSequencer } from 'actions/controlActions';
import Sequencer from 'engine/Sequencer';

require('styles/reset.css');
require('normalize.css/normalize.css');
require('styles/theme.css');
require('styles/Header.css');
require('styles/Layout.css');
require('styles/App.css');
require('styles/TrackList.css');
require('styles/Keyboard.css');
require('styles/CompositionGrid.css');
require('styles/TrackDetails.css');
require('styles/Footer.css');
require('styles/ViewBar.css');
require('styles/Fonts.css');

class Main extends React.Component {
    componentDidMount() {
        this.props.dispatch(initializeWebAudio());
        this.props.dispatch(fetchSamplerInstrument(0));
        /**
         * TODO: get rid of that. This is becaouse TrackList -> Instruments get initialized before whole Store, which makes Context unreachable
         */
        this.props.dispatch(initInstrumentContext(1));
        this.props.control.midiController.init();
        // Sequencer lifecycle used to live in ControlBar's constructor; ControlBar
        // is gone (Stage 3), so init the scheduler here at app mount.
        const sequencer = new Sequencer();
        sequencer.init();
        this.props.dispatch(initSequencer(sequencer));
    }

    render() {
        return <Layout />;
    }
}
const mapStateToProps = (state) => {
    return {
        webAudio: state.webAudio,
        control: state.control,
    };
};
//REDUX connection
export default connect(mapStateToProps)(Main);
