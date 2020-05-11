import React from 'react';
import { Knob, Ui } from '../shared/Knob/Knob';
import * as Utils from 'engine/Utils';

class PanKnob extends React.Component {
    knob = null;
    inputs = [];
    initKnob(input) {
        if (!Utils.isNullOrUndefined(input)) {
            let exists = false;
            for (let i = 0; i < this.inputs.length; i++) {
                if (this.inputs[i] === input.id) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                this.inputs.push(input.id);
                input.setAttribute('data-width', 40);
                input.setAttribute('data-height', 40);
                input.setAttribute('data-angleOffset', 220);
                input.setAttribute('data-angleRange', 280);

                const knopf = new Knob(input, new Ui.P2());
                this.knob = knopf;
                input.addEventListener('change', (e) => { this.onChange(e, input.id, knopf) });
            } else{
                const pan = this.props.pan < 0.001 && this.props.pan > -0.001 ? 0  : this.props.pan;
                if(Number(this.knob.value) !== pan){
                    this.knob.update(this.props.pan);
                }
            }
        }
    }

    onChange(event, id, knopf) {
        this.props.onPanChange(this.props.trackIndex, Number(knopf.value));
    }

    render() {
        return (
            <div className="panKnobDiv">
                <p>Pan: {this.props.pan < 0.001 && this.props.pan > -0.001 ? 0 : this.props.pan}</p>
                <input
                    id="pan"
                    type="range"
                    min="-100"
                    max="100"
                    ref={(input) => { this.initKnob(input); }}
                />
            </div>
        );
    }
}

export default PanKnob;