import React from 'react';
import WhiteKey from './WhiteKey';
import BlackKey from './BlackKey';
import PropTypes from 'prop-types';

const OctaveComponent = (props) => {
    return (
        <div className="octave octaveShort" id={'Octave' + props.index}>
            <WhiteKey onDown={() => props.handleDown(props.index * 12)} />
            <WhiteKey onDown={() => props.handleDown(props.index * 12 + 2)} />
            <WhiteKey onDown={() => props.handleDown(props.index * 12 + 4)} />
            <WhiteKey onDown={() => props.handleDown(props.index * 12 + 5)} />
            <WhiteKey onDown={() => props.handleDown(props.index * 12 + 7)} />
            <WhiteKey onDown={() => props.handleDown(props.index * 12 + 9)} />
            <WhiteKey onDown={() => props.handleDown(props.index * 12 + 11)} />
            <div className="flatKeys">
                <BlackKey onDown={() => props.handleDown(props.index * 12 + 1)} />
                <BlackKey onDown={() => props.handleDown(props.index * 12 + 3)} />
                <BlackKey onDown={() => props.handleDown(props.index * 12 + 6)} />
                <BlackKey onDown={() => props.handleDown(props.index * 12 + 8)} />
                <BlackKey onDown={() => props.handleDown(props.index * 12 + 10)} />
            </div>
        </div>
    );
}
OctaveComponent.propTypes = {
    index: PropTypes.number.isRequired,
    handleDown: PropTypes.func.isRequired
}
export default OctaveComponent;