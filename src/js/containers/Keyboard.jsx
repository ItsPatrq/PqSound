import React from 'react';
import Octave from 'components/Keyboard/Octave';
import { connect } from 'react-redux';

class Keyboard extends React.Component {
    constructor() {
        super();
        this.lastPressedKey = null;

        document.onmouseup = this.handleUp.bind(this);
    }

    componentDidMount() {

    }

    handleUp() {
        if (this.lastPressedKey !== null) {
            this.props.keysSounds[this.lastPressedKey].stop();
            this.lastPressedKey = null;
        }
    }

    handleDown(i) {
        this.lastPressedKey = i;
        this.props.keysSounds[i].play();
    }

    render() {
        if (this.props.keyboard.show) {
            var renderOctaves = new Array;
            for (var i = 0; i < this.props.keyboard.octaves; i++) {
                renderOctaves.push(<Octave index={i} key={i.toString()} handleDown={this.handleDown.bind(this)} />);
            }
            return (
                <div className="keyboardBody">
                    <div className="colorLine"></div>
                    {renderOctaves}
                </div>
            );
        }
        return null;
    }
}

//REDUX connection
const mapStateToProps = (state) => {
    return {
        keyboard: state.keyboard,
        keysSounds: state.webAudio.keyboard.sounds
    }
}

export default connect(mapStateToProps)(Keyboard);