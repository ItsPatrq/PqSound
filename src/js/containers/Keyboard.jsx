import React from 'react';
import Octave from 'components/Keyboard/Octave';
import {connect} from 'react-redux';

class Keyboard extends React.Component {
    constructor(){
        super();
    }
    render() {
        console.log(this.props);
        if (this.props.keyboard.show) {
            var renderOctaves = new Array;
            for (var i = 0; i < this.props.keyboard.octaves; i++) {
                renderOctaves.push(<Octave index={i} key={i.toString()} handleDown={() => {}} />);
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
        keyboard: state.keyboard
    }
}

export default connect(mapStateToProps)(Keyboard);