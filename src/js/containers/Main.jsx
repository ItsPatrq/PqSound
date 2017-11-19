import React from 'react';
import Layout from 'components/Layout';
import { connect } from 'react-redux';
import { initializeWebAudio, fetchSamplerInstrument } from 'actions/webAudioActions';

require('styles/reset.css');
require('normalize.css/normalize.css');
require('styles/App.css');
require('styles/TrackList.css');
require('styles/Keyboard.css');
require('styles/CompositionGrid.css');

class Main extends React.Component {
    componentDidMount() {
        this.props.dispatch(initializeWebAudio());
        this.props.dispatch(fetchSamplerInstrument('piano', true, 1));
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