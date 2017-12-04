import React from 'react';
import Layout from 'components/Layout';
import { connect } from 'react-redux';
import { initializeWebAudio, fetchSamplerInstrument } from 'actions/webAudioActions';
import {initTrackSound} from '../actions/trackListActions'

require('styles/reset.css');
require('normalize.css/normalize.css');
require('styles/App.css');
require('styles/TrackList.css');
require('styles/Keyboard.css');
require('styles/CompositionGrid.css');
require('styles/TrackDetails.css');

class Main extends React.Component {
    componentDidMount() {
        this.props.dispatch(initializeWebAudio());
        this.props.dispatch(fetchSamplerInstrument('DSK Grand Piano', true, 1));
        this.props.dispatch(initTrackSound(1));
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