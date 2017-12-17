import React from 'react';
import * as Utils from 'engine/Utils';
import { Knob, Ui } from 'engine/Knob';
require('styles/Monotron.css');

class Monotron extends React.Component {
    constructor() {
        super();
    }
    params = {
        rate: {
            min: 0.001,
            max: 900.0,
            scale: 1.1
        },
        int: {
            min: 0.5,
            max: 500.0
        },
        cutoff: {
            min: 0.001,
            max: 900.0,
            scale: 1.03
        },
        peak: {
            min: 0.001,
            max: 1000.0,
            scale: 1.10
        },
        pitch: {
            min: 0.0,
            max: 2000.0,
            scale: 1.10
        }
    };
    knobs = [];
    inputs = [];
    initKnob = (input) => {
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

                let knopf = new Knob(input, new Ui.P2());
                switch (input.id) {
                    case 'pitch': {
                        knopf.update(57);
                        break;
                    }
                    case 'rate': {
                        knopf.update(46);
                        break;
                    }
                    case 'int': {
                        knopf.update(97);
                        break;
                    }
                    case 'cutoff': {
                        knopf.update(72);
                        break;
                    }
                    case 'peak': {
                        knopf.update(57);
                        break;
                    }
                }
                this.knobs.push(knopf);
                input.addEventListener('change', (e) => { this.onChange(e, input.id, knopf) })
                this.onChange(null, input.id, knopf);
            }
        }
    }
    onChange = (event, id, knopf) => {
        let ratio, scale, value;
        let param = this.params[id];
        if (!Utils.isNullOrUndefined(param)) {
            scale = param.scale != null ? param.scale : 1.05;
            ratio = Math.pow(scale, parseInt(knopf.value)) / Math.pow(scale, knopf.settings.max);
            value = ratio * (param.max - param.min) + param.min;
            this.props.instrument.updatePreset(value, id, this.props.trackIndex)
        }
    }
    onModChange(event) {
        this.props.instrument.updatePreset(event.target.value, 'mod', this.props.trackIndex)
    }
    render() {
        return (
            <div id="monotron" >
                <div id="brand">
                    <h1 id="title">Monotron</h1>
                    <div id="description">Analogue Ribbon Synthesizer</div>
                </div>
                <div id="controls">
                    <div className="panel">
                        <label>
                            {/* <select id="mod" onChange={this.onModChange.bind(this)} value={this.props.instrument.preset.mod}>
                                <option value="standby">Standby</option>
                                <option value="pitch">Pitch</option>
                                <option value="cutoff">Cutoff</option>
                            </select> */}
                            <div className="radio">
                                <label>
                                    <input
                                        type="radio"
                                        value="standby"
                                        checked={this.props.instrument.preset.mod === 'standby'}
                                        onChange={this.onModChange.bind(this)}
                                    />
                                    Standby
                                </label>
                            </div>
                            <div className="radio">
                                <label>
                                    <input
                                        type="radio"
                                        value="pitch"
                                        checked={this.props.instrument.preset.mod === 'pitch'}
                                        onChange={this.onModChange.bind(this)}
                                    />
                                    Pitch
                                </label>
                            </div>
                            <div className="radio">
                                <label>
                                    <input
                                        type="radio"
                                        value="cutoff"
                                        checked={this.props.instrument.preset.mod === 'cutoff'}
                                        onChange={this.onModChange.bind(this)}
                                    />
                                    Cutoff
                                </label>
                            </div>
                            <br />Mod
                        </label>
                    </div>
                    <div className="panel">
                        <h2 className="subtitle">VCO</h2>
                        <div className="knobs">
                            <div className="knob">
                                <input
                                    id="pitch"
                                    type="range"
                                    min="0"
                                    max="100"
                                    value="25"
                                    ref={(input) => { this.initKnob(input); }}
                                    onChange={(e) => this.onChange(e, 'cutoff')}
                                />
                                <label>Pitch</label>
                            </div>
                        </div>
                    </div>
                    <div className="panel">
                        <h2>LFO</h2>
                        <div className="knobs">
                            <div className="knob">
                                <input
                                    id="rate"
                                    type="range"
                                    min="0"
                                    max="100"
                                    ref={(input) => { this.initKnob(input); }}
                                    onChange={(e) => this.onChange(e, 'cutoff')}
                                />
                                <label>Rate</label>
                            </div>
                            <div className="knob">
                                <input
                                    id="int"
                                    type="range"
                                    min="0"
                                    max="100"
                                    ref={(input) => { this.initKnob(input); }}
                                    onChange={(e) => this.onChange(e, 'cutoff')}
                                />
                                <label>Int.</label>
                            </div>
                        </div>
                    </div>
                    <div className="panel">
                        <h2>VCF</h2>
                        <div className="knobs">
                            <div className="knob">
                                <input
                                    id="cutoff"
                                    type="range"
                                    min="0"
                                    max="100"
                                    ref={(input) => { this.initKnob(input); }}
                                    onChange={(e) => this.onChange(e, 'cutoff')}
                                />
                                <label>Cutoff</label>
                            </div>
                            <div className="knob">
                                <input
                                    id="peak"
                                    type="range"
                                    min="0"
                                    max="100"
                                    ref={(input) => { this.initKnob(input); }}
                                    onChange={(e) => this.onChange(e, 'cutoff')}
                                />
                                <label>Peak</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Monotron;