import React from 'react';
import WhiteKey from './WhiteKey';
import BlackKey from './BlackKey';
import PropTypes from 'prop-types';

const OctaveComponent = (props) => {
    return (
        <div className="octave octaveShort" id={'Octave' + props.index}>
            <WhiteKey onDown={() => props.handleDown(props.index)} />
            <WhiteKey onDown={() => props.handleDown(props.index + 2)} />
            <WhiteKey onDown={() => props.handleDown(props.index + 4)} />
            <WhiteKey onDown={() => props.handleDown(props.index + 5)} />
            <WhiteKey onDown={() => props.handleDown(props.index + 7)} />
            <WhiteKey onDown={() => props.handleDown(props.index + 9)} />
            <WhiteKey onDown={() => props.handleDown(props.index + 11)} />
            <div className="flatKeys">
                <BlackKey onDown={() => props.handleDown(props.index + 1)} />
                <BlackKey onDown={() => props.handleDown(props.index + 3)} />
                <BlackKey onDown={() => props.handleDown(props.index + 6)} />
                <BlackKey onDown={() => props.handleDown(props.index + 8)} />
                <BlackKey onDown={() => props.handleDown(props.index + 10)} />
            </div>
        </div>
    );
}
OctaveComponent.propTypes = {
    index: PropTypes.number.isRequired
}
export default OctaveComponent;