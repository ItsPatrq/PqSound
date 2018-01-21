import React from 'react';
import { MenuItem, DropdownButton } from 'react-bootstrap';
import { oscillatorTypes } from 'constants/Constants';


require('styles/Instruments/PqSynth.css');

const PqSynth = (props) => {
    let handleChange = (param, oscillator, oscilatorNumber, value) => {
        let newPreset = JSON.parse(JSON.stringify(props.instrument.preset));
        if(oscillator){
            newPreset.oscillators[oscilatorNumber][param] = value;
        }
        console.log(newPreset,param, oscillator, oscilatorNumber, value)
        props.onPresetChange(newPreset);
    }
    let oscillators = new Array;
    for (let i = 0; i < 3; i++) {
        let shapeTypes = new Array;
        let octaveShifts = new Array;
        for (let j = 0; j < oscillatorTypes.length; j++) {
            shapeTypes.push(
                <MenuItem
                    key={'oscilator' + i + 'shape' + oscillatorTypes[j]}
                    eventKey={'oscilator' + i + 'shape' + oscillatorTypes[j]}
                    onClick={() => handleChange('waveForm', true, i, oscillatorTypes[j])}
                >
                    {oscillatorTypes[j]}
                </MenuItem>
            )
        }
        shapeTypes.push(
            <MenuItem
                key={'oscilator' + i + 'shapenoise'}
                eventKey={'oscilator' + i + 'shapenoise'}
                onClick={() => handleChange('waveForm', true, i, 'noise')}
            >
                {'noise'}
            </MenuItem>
        )
        for (let j = 0; j < 7; j++) {
            octaveShifts.push(
                <MenuItem
                    key={'oscilator' + i + 'octShift' + (j - 3)}
                    eventKey={'oscilator' + i + 'octShift' + (j - 3)}
                    onClick={() => handleChange('frequencyModOct', true, i, j-3)}
                >
                    {j - 3 === 0 ? 'none' : j - 3}
                </MenuItem>
            )
        }
        oscillators.push(
            <div className="pqSynthOscilator" key={i.toString()}>
                <div className="pqSynthOscilatorTag">
                    <h2>oscillator {i + 1}</h2>
                </div>
                <div className="pqSynthSwitch">
                        <label>
                            <input
                                type="radio"
                                value="standby"
                                checked={props.instrument.preset.oscillators[i].active}
                                onChange={() => handleChange('active', true, i, true)}
                            />
                            On
                                </label>
                        <label>
                            <input
                                type="radio"
                                value="pitch"
                                checked={!props.instrument.preset.oscillators[i].active}
                                onChange={() => handleChange('active', true, i, false)}
                            />
                            Off
                            </label>
                    </div>
                <div className="waveformSection">
                    <div className="waveformSelectorLabel">
                        <h3>waveform:</h3>
                    </div>
                    <DropdownButton id={'oscilator-types-drop-down'} bsStyle="link" className="waveformSelector" title={props.instrument.preset.oscillators[i].waveForm} >
                        {shapeTypes}
                    </DropdownButton>
                </div>
                <div className="frequencyModSection">
                    <div className="sectionLabel">
                        <h3>simple frequency modifier</h3>
                    </div>
                    <div className="frequencyModOctPercent">
                        <label>shift (in %): {props.instrument.preset.oscillators[i].frequencyModPercent}</label>
                        <input type="range"
                            value={props.instrument.preset.oscillators[i].frequencyModPercent}
                            step="0.01"
                            min="-100"
                            max="100"
                            onChange={(event) => handleChange('frequencyModPercent', true, i, Number(event.target.value))}
                        />
                    </div>
                    <div className="frequencyModOctSelector">
                        <div className="frequencyModOctSelectorLabel">
                            <h3>shift (in octaves)</h3>
                        </div>
                        <DropdownButton id={'oscilator-types-drop-down'} bsStyle="link" className="waveformSelector"
                            title={props.instrument.preset.oscillators[i].frequencyModOct ? props.instrument.preset.oscillators[i].frequencyModOct : 'none'} >
                            {octaveShifts}
                        </DropdownButton>
                    </div>
                    <div className="sectionLabel">
                        <h3>LFO frequency modifier</h3>
                    </div>
                    <div className="pqSynthSwitch">
                        <label>
                            <input
                                type="radio"
                                value="standby"
                                checked={props.instrument.preset.oscillators[i].frequencyModLfo}
                                onChange={() => handleChange('frequencyModLfo', true, i, true)}
                            />
                            On
                                </label>
                        <label>
                            <input
                                type="radio"
                                value="pitch"
                                checked={!props.instrument.preset.oscillators[i].frequencyModLfo}
                                onChange={() => handleChange('frequencyModLfo', true, i, false)}
                            />
                            Off
                            </label>
                    </div>
                    <div className="frequencyModLfoSlider">
                    <label>frequency (Hz): {props.instrument.preset.oscillators[i].frequencyModLfoHz}</label>
                        <input type="range"
                            value={props.instrument.preset.oscillators[i].frequencyModLfoHz}
                            step="0.01"
                            min="0.1"
                            max="1000"
                            onChange={(event) => handleChange('frequencyModLfoHz', true, i, Number(event.target.value))}
                        />
                    </div>
                    <div className="frequencyModLfoSlider">
                        <label>width: {props.instrument.preset.oscillators[i].frequencyModLfoWidth}</label>
                        <input type="range"
                            value={props.instrument.preset.oscillators[i].frequencyModLfoWidth}
                            step="0.01"
                            min="0.01"
                            max="1000"
                            onChange={(event) => handleChange('frequencyModLfoWidth', true, i, Number(event.target.value))}
                        />
                    </div>
                </div>
                <div className="amplitudeModSection">
                    <div className="sectionLabel">
                        <h2>amplitude simple modifier</h2>
                    </div>
                    <div className="frequencyModLfoSlider">
                        <label>scale (in %): {props.instrument.preset.oscillators[i].amplitudeModPercent}</label>
                        <input type="range"
                            value={props.instrument.preset.oscillators[i].amplitudeModPercent}
                            step="1"
                            min="0"
                            max="100"
                            onChange={(event) => handleChange('amplitudeModPercent', true, i,Number(event.target.value))}
                        />
                    </div>
                    <div className="sectionLabel">
                        <h2>amplitude lfo modifier</h2>
                    </div>
                    <div className="pqSynthSwitch">
                        <label>
                            <input
                                type="radio"
                                value="standby"
                                checked={props.instrument.preset.oscillators[i].amplitudeModLfo}
                                onChange={() => handleChange('amplitudeModLfo', true, i,true)}
                            />
                            On
                                </label>
                        <label>
                            <input
                                type="radio"
                                value="pitch"
                                checked={!props.instrument.preset.oscillators[i].amplitudeModLfo}
                                onChange={() => handleChange('amplitudeModLfo', true, i,false)}
                            />
                            Off
                            </label>
                    </div>
                    <div className="frequencyModLfoSlider">
                        <label>frequency (in Hz): {props.instrument.preset.oscillators[i].amplitudeModLfoHz}</label>
                        <input type="range"
                            value={props.instrument.preset.oscillators[i].amplitudeModLfoHz}
                            step="0.01"
                            min="0.1"
                            max="20"
                            onChange={(event) => handleChange('amplitudeModLfoHz', true, i, Number(event.target.value))}
                        />
                    </div>
                    <div className="frequencyModLfoSlider">
                        <label>width: {props.instrument.preset.oscillators[i].amplitudeModLfoWidth}</label>
                        <input type="range"
                            value={props.instrument.preset.oscillators[i].amplitudeModLfoWidth}
                            step="0.01"
                            min="0"
                            max="1"
                            onChange={(event) => handleChange('amplitudeModLfoWidth', true, i, Number(event.target.value))}
                        />
                    </div>
                </div>
            </div>
        )
    }
    return (
        <div className="pqSynthContainer">
            <div className="pqSynthOscilatorsContainer">
                {oscillators}
            </div>
        </div>
    );
}
export default PqSynth;