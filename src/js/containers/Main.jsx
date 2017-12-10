import React from 'react';
import Layout from 'components/Layout';
import { connect } from 'react-redux';
import { initializeWebAudio, fetchSamplerInstrument } from 'actions/webAudioActions';
import {initInstrumentContext} from '../actions/trackListActions'

require('styles/reset.css');
require('normalize.css/normalize.css');
require('styles/App.css');
require('styles/TrackList.css');
require('styles/Keyboard.css');
require('styles/CompositionGrid.css');
require('styles/TrackDetails.css');
require('styles/ControlBar');

class Main extends React.Component {
    componentDidMount() {
        this.props.dispatch(initializeWebAudio());
        this.props.dispatch(fetchSamplerInstrument(0));
        /**
         * TODO: get rid of that. This is becaouse TrackList -> Instruments get initialized before whole Store, which makes Context unreachable
         */
        this.props.dispatch(initInstrumentContext(1));
    }

    render() {
        return (
            <Layout />
        );
    }
}
const mapStateToProps = (state) => {
    return {
        webAudio: state.webAudio
    }
}
//REDUX connection
export default connect(mapStateToProps)(Main);