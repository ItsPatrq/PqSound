import React from 'react';
import { MenuItem, DropdownButton } from 'react-bootstrap';
import {oscilatorTypes} from 'constants/Constants';

require('styles/Instruments/MultiOsc.css');

const MultiOsc = (props) => {
    let handleChange = (newSawNumber, newDetune, newAttack, newDecay, newOscilatorType) => {
        props.onPresetChange({
            ...props.instrument.preset,
            sawNumber: newSawNumber ? Number(newSawNumber) : props.instrument.preset.sawNumber,
            detune: newDetune ? Number(newDetune) : props.instrument.preset.detune,
            attack: newAttack ? Number(newAttack) : props.instrument.preset.attack,
            decay: newDecay ? Number(newDecay) : props.instrument.preset.decay,
            oscilatorType: newOscilatorType ? newOscilatorType : props.instrument.preset.oscilatorType
        })
    }
    let oscilatorTypesDropdownItems = new Array;
    for(let i = 0; i < oscilatorTypes.length; i++){
        oscilatorTypesDropdownItems.push(
            <MenuItem
                    key={oscilatorTypes[i]}
                    eventKey={oscilatorTypes[i]}
                    onClick={(event) => handleChange(null, null, null, null, oscilatorTypes[i])}                    
            >
                    {oscilatorTypes[i]}
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
                {oscilatorTypesDropdownItems}
            </DropdownButton>
            </div>
            <div className="multiOscSliderContainer">
                <label>Number of oscilators: {props.instrument.preset.sawNumber}</label>
                <input type="range"
                    value={props.instrument.preset.sawNumber}
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
                <label>Decay: {props.instrument.preset.decay}</label>
                <input type="range"
                    value={props.instrument.preset.decay}
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