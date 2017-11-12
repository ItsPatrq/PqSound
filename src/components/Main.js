require('styles/reset.css');
require('normalize.css/normalize.css');
require('styles/App.css');
require('styles/Keyboard.css');

const BufferLoader = require('../engine/BufferLoader');
const Sound = require('../engine/Sound');

import React from 'react';
import Text from './Text';
import Button from 'react-bootstrap/lib/Button';
import Keyboard from './Keyboard/Keyboard';
import TopNavBar from './TopNavBar';
import { Col, Grid, Row } from 'react-bootstrap';
import pianoSounds from '../engine/audioFiles';

class AppComponent extends React.Component {
  constructor() {
    super();
    this.keyboardBuffers = new Array;
    this.keys = new Array;
    this.bufferLoader = null;
    this.context = null;
    this.lastPressedKey = null;

    this.state = {
      text: 'Not clicked!',
      showKeyboard: false,
      numberOfOctaves: 1,
      firstOctave: 1
    };

    document.onmouseup = this.handleUp.bind(this);
  }

  componentDidMount() {
    this.bufferLoader = new BufferLoader(
      this,
      pianoSounds.pianoSounds,
      function (bufferList) {
        for (let i = 0; i < bufferList.length; i++) {
          this.mainApp.keyboardBuffers.push(bufferList[i]);
        }
        for (let i = 0; i < this.mainApp.state.numberOfOctaves * 12; i++) {
          this.mainApp.keys.push(new Sound(this.mainApp.context, this.mainApp.keyboardBuffers[i]));
        }
      }
    );
    this.bufferLoader.load();
  }

  handleDown(i) {
    this.lastPressedKey = i;
    this.keys[i].play();
  }
  handleUp() {
    if (this.lastPressedKey !== null) {
      this.keys[this.lastPressedKey].stop();
      this.lastPressedKey = null;
    }
  }

  onButtonClicked() {
    this.setState(prevState => ({
      text: 'Clicked!',
      showKeyboard: !prevState.showKeyboard
    }));
  }

  render() {
    return (
      <div className="main">
        <TopNavBar />
        <Grid fluid>
          <Row>
            <Col xs={2} className="nopadding">
              <Col xs={6} className="trackDetails nopadding">
                track-details(current)
              </Col>
              <Col xs={6} className="trackDetails nopadding">
                track-details(master)
              </Col>
            </Col>
            <Col xs={10} className="nopadding">
              <Col xs={2} className="trackList nopadding">
                trackList
              </Col>
              <Col xs={10} className="nopadding trackList">
                <Col className="tempRed nopadding">
                  <Text staticText="Text from child component"
                    clickText={this.state.text} />
                  <p>{this.state.text}</p>
                  <Button onClick={this.onButtonClicked.bind(this)}>Click me!</Button>
                </Col>
              </Col>
              <Col className="keyboard">
                <Keyboard show={this.state.showKeyboard} octaves={this.state.numberOfOctaves} handleDown={this.handleDown.bind(this)} />
              </Col>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default AppComponent;