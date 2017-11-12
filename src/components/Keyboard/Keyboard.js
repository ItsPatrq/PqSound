import React from 'react';
import PropTypes from 'prop-types';
import Octave from './Octave';

const KeyboardComponent = (props) => {
    if (props.show) {
        var renderOctaves = new Array;
        for (var i = 0; i < props.octaves; i++) {
            renderOctaves.push(<Octave index={i} key={i.toString()} handleClick={props.handleClick} />);
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
KeyboardComponent.propTypes = {
    show: PropTypes.bool.isRequired,
    octaves: PropTypes.number.isRequired
}
export default KeyboardComponent;