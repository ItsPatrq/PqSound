import React from 'react';
import { MenuItem, DropdownButton } from 'react-bootstrap';
import {oscillatorTypes} from 'constants/Constants';

require('styles/Instruments/MultiOsc.css');

const MultiOsc = (props) => {
    let handleChange = (newWaveNumber, newDetune, newAttack, newRelease, newOscilatorType) => {
        props.onPresetChange({
            ...props.instrument.preset,
            waveNumber: newWaveNumber ? Number(newWaveNumber) : props.instrument.preset.waveNumber,
            detune: newDetune ? Number(newDetune) : props.instrument.preset.detune,
            attack: newAttack ? Number(newAttack) : props.instrument.preset.attack,
            release: newRelease ? Number(newRelease) : props.instrument.preset.release,
            oscilatorType: newOscilatorType ? newOscilatorType : props.instrument.preset.oscilatorType
        })
    }
    let oscillatorTypesDropdownItems = new Array;
    for(let i = 0; i < oscillatorTypes.length; i++){
        oscillatorTypesDropdownItems.push(
            <MenuItem
                    key={oscillatorTypes[i]}
                    eventKey={oscillatorTypes[i]}
                    onClick={() => handleChange(null, null, null, null, oscillatorTypes[i])}
            >
                    {oscillatorTypes[i]}
                </MenuItem>
        )
    }
    return (
        <div className="multiOscContainer">
            <div className="multiOscBrand">
                <h1 className="multiOscTitle">MultiOsc Synth</h1>
            </div>
            <div className="multiOscTypeSelector">
            <p>Oscilator type: </p>
            <DropdownButton id={'oscilator-types-drop-down'} bsStyle="default" className="drop-down" title={props.instrument.preset.oscilatorType} >
                {oscillatorTypesDropdownItems}
            </DropdownButton>
            </div>
            <div className="multiOscSliderContainer">
                <label>Number of oscilators: {props.instrument.preset.waveNumber}</label>
                <input type="range"
                    value={props.instrument.preset.waveNumber}
                    step="1"
                    min="1"
                    max="20"
                    onChange={(event) => handleChange(event.target.value)}
                />
            </div>
            <div className="multiOscSliderContainer">
                <label>Detune: {props.instrument.preset.detune}</label>
                <input type="range"
                    value={props.instrument.preset.detune}
                    step="1"
                    min="0"
                    max="100"
                    onChange={(event) => handleChange(null, event.target.value)}
                />
            </div>
            <div className="multiOscSliderContainer">
                <label>Attack: {props.instrument.preset.attack}</label>
                <input type="range"
                    value={props.instrument.preset.attack}
                    step="0.02"
                    min="0"
                    max="4"
                    onChange={(event) => handleChange(null, null, event.target.value)}
                />
            </div>
            <div className="multiOscSliderContainer">
                <label>Release: {props.instrument.preset.release}</label>
                <input type="range"
                    value={props.instrument.preset.release}
                    step="0.02"
                    min="0"
                    max="4"
                    onChange={(event) => handleChange(null, null, null, event.target.value)}
                />
            </div>
        </div>
    );
}
export default MultiOsc;