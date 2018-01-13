import React from 'react';

const MultiSaw = (props) => {
    let handleChange = (newAttack, newRelease) => {
        props.onPresetChange({
            ...props.instrument.preset,
            attack: newAttack ? Number(newAttack) : props.instrument.preset.attack,
            release: newRelease ? Number(newRelease) : props.instrument.preset.release
        })
    }
    return (
        <div className="samplerContainer">
            <div className="samplerSliderContainer">
            <label>Attack: {props.instrument.preset.attack}</label>
                    <input type="range"
                        value={props.instrument.preset.attack}
                        step="0.02"
                        min="0"
                        max="4"
                        onChange={(event) => handleChange(event.target.value)}
                    />
            </div>
            <div className="samplerSliderContainer">
            <label>Release: {props.instrument.preset.release}</label>
                    <input type="range"
                        value={props.instrument.preset.release}
                        step="0.02"
                        min="0"
                        max="4"
                        onChange={(event) => handleChange(null, event.target.value)}
                    />
            </div>
        </div>
    );
}
export default MultiSaw;