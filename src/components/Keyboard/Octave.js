import React from 'react';
import WhiteKey from './WhiteKey';
import BlackKey from './BlackKey';
import PropTypes from 'prop-types';

const OctaveComponent = (props) => {
    return (
        <div className="octave octaveShort" id={'Octave' + props.index}>
            <WhiteKey onClick={() => props.handleClick(props.index)} />
            <WhiteKey onClick={() => props.handleClick(props.index + 2)} />
            <WhiteKey onClick={() => props.handleClick(props.index + 4)} />
            <WhiteKey onClick={() => props.handleClick(props.index + 5)} />
            <WhiteKey onClick={() => props.handleClick(props.index + 7)} />
            <WhiteKey onClick={() => props.handleClick(props.index + 9)} />
            <WhiteKey onClick={() => props.handleClick(props.index + 11)} />
            <div className="flatKeys">
                <BlackKey onClick={() => props.handleClick(props.index + 1)} />
                <BlackKey onClick={() => props.handleClick(props.index + 3)} />
                <BlackKey onClick={() => props.handleClick(props.index + 6)} />
                <BlackKey onClick={() => props.handleClick(props.index + 8)} />
                <BlackKey onClick={() => props.handleClick(props.index + 10)} />
            </div>
        </div>
    );
}
OctaveComponent.propTypes = {
    index: PropTypes.number.isRequired
}
export default OctaveComponent;