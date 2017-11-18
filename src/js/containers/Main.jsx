import React from 'react';
import Layout from 'components/Layout';

require('styles/reset.css');
require('normalize.css/normalize.css');
require('styles/App.css');
require('styles/TrackList.css');
require('styles/Keyboard.css');

class Main extends React.Component {
    constructor(){
        super();
    }
    render() {
        return (
            <Layout/>
        );
    }
}

export default Main;