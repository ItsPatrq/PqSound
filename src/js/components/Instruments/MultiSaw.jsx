import React from 'react';

require('styles/Instruments/MultiSaw.css');

const MultiSaw = (props) => {
    let handleChange = (newSawNumber, newDetune, newAttack, newDecay) => {
        props.onPresetChange({
            ...props.instrument.preset,
            sawNumber: newSawNumber ? Number(newSawNumber) : props.instrument.preset.sawNumber,
            detune: newDetune ? Number(newDetune) : props.instrument.preset.detune,
            attack: newAttack ? Number(newAttack) : props.instrument.preset.attack,
            decay: newDecay ? Number(newDecay) : props.instrument.preset.decay
        })
    }
    return (
        <div className="multiSawContainer">
            <div className="multiSawBrand">
                <h1 className="multiSawTitle">MultiSaw Synth</h1>
            </div>
            <div className="multiSawSliderContainer">
                <label>Number of saws: {props.instrument.preset.sawNumber}</label>
                <input type="range"
                    value={props.instrument.preset.sawNumber}
                    step="1"
                    min="1"
                    max="20"
                    onChange={(event) => handleChange(event.target.value)}
                />
            </div>
            <div className="multiSawSliderContainer">
                <label>Detune: {props.instrument.preset.detune}</label>
                <input type="range"
                    value={props.instrument.preset.detune}
                    step="1"
                    min="0"
                    max="100"
                    onChange={(event) => handleChange(null, event.target.value)}
                />
            </div>
            <div className="multiSawSliderContainer">
                <label>Attack: {props.instrument.preset.attack}</label>
                <input type="range"
                    value={props.instrument.preset.attack}
                    step="0.02"
                    min="0"
                    max="4"
                    onChange={(event) => handleChange(null, null, event.target.value)}
                />
            </div>
            <div className="multiSawSliderContainer">
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
export default MultiSaw;