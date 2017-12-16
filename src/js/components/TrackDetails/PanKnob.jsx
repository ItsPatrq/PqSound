import React from 'react';

const PanKnob = (props) => {

    return (
        <div className="panKnobDiv">
            <p>Pan: {props.pan}</p>
            <input className="panKnob" type="range" min={0} max={100} />
        </div>
    );
}

export default PanKnob;