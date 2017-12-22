import React from 'react';
import { Knob, Ui } from 'engine/Knob';

const PanKnob = (props) => {

    let initKnob = (input) => {
        if(input){
        input.setAttribute('data-width', 40);
        input.setAttribute('data-height', 40);
        input.setAttribute('data-angleOffset', 220);
        input.setAttribute('data-angleRange', 280);

        let knopf = new Knob(input, new Ui.P2());
        }
    }

    let change = () => {}

    return (
        <div className="panKnobDiv">
            <p>Pan: {props.pan}</p>
            <input
                id="pitch"
                type="range"
                min="0"
                max="100"
                value="25"
                ref={(input) => { initKnob(input); }}
                onChange={(e) => onChange(e, 'cutoff')}
            />
            <label>Pitch</label>
        </div>
    );
}

export default PanKnob;