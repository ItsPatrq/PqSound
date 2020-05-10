import React from 'react';
import * as Utils from 'engine/Utils';
import { Knob, Ui } from '../shared/Knob/Knob';
require('styles/Instruments/Monotron.css');

class Monotron extends React.Component {
    params = {
        rate: {
            min: 0.001,
            max: 900.0,
            scale: 1.1
        },
        int: {
            min: 0.5,
            max: 350.0
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
                        knopf.update(this.props.instrument.preset.vco.knobPitch);
                        break;
                    }
                    case 'rate': {
                        knopf.update(this.props.instrument.preset.lfo.knobRate);
                        break;
                    }
                    case 'int': {
                        knopf.update(this.props.instrument.preset.lfo.knobInt);
                        break;
                    }
                    case 'cutoff': {
                        knopf.update(this.props.instrument.preset.vcf.knobCutoff);
                        break;
                    }
                    case 'peak': {
                        knopf.update(this.props.instrument.preset.vcf.knobPeak);
                        break;
                    }
                }
                this.knobs.push(knopf);
                input.addEventListener('change', (e) => { this.onChange(e, input.id, knopf) })
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
            switch(id){
                case 'pitch':{
                    this.props.onPresetChange({vco: {pitch: value, knobPitch: knopf.value}});
                    break;
                }
                case 'rate':{
                    this.props.onPresetChange({lfo: {
                        rate: value, knobRate: knopf.value,
                        int: this.props.instrument.preset.lfo.int, knobInt: this.props.instrument.preset.lfo.knobInt
                    }});
                    break;
                }
                case 'int':{
                    this.props.onPresetChange({lfo: {
                        int: value, knobInt: knopf.value,
                        rate: this.props.instrument.preset.lfo.rate, knobInt: this.props.instrument.preset.lfo.knobRate
                    }});
                    break;
                }
                case 'cutoff':{
                    this.props.onPresetChange({vcf: {
                        cutoff: value, knobCutoff: knopf.value,
                        peak: this.props.instrument.preset.vcf.peak, knobPeak: this.props.instrument.preset.vcf.knobPeak
                        }});
                    break;
                }
                case 'peak':{
                    this.props.onPresetChange({vcf: {
                        peak: value, knobPeak: knopf.value,
                        cutoff: this.props.instrument.preset.vcf.cutoff, knobPeak: this.props.instrument.preset.vcf.knobCutoff
                    }});
                    break;
                }
            }
        }
    }
    onModChange(event) {
        this.props.onPresetChange({mod: event.target.value});
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
                                    ref={(input) => { this.initKnob(input); }}
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