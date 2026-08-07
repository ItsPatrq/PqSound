import * as React from 'react';

const SoloMuteButtons = (props) => {
    const buttonMute = (
        <button
            className={'soloMuteBtn muteBtn' + (props.trackDetails.mute ? ' is-active' : '')}
            onClick={() => props.onMuteButtonClicked(props.trackDetails.index)}
        >
            M
        </button>
    );
    let buttonSolo = (
        <button
            className={'soloMuteBtn soloBtn' + (props.trackDetails.solo ? ' is-active' : '')}
            onClick={() => props.onSoloButtonClicked(props.trackDetails.index)}
        >
            S
        </button>
    );
    if (props.trackDetails.index === 0) {
        buttonSolo = null;
    }
    return (
        <div className="soloMuteButtons">
            {buttonSolo}
            {buttonMute}
        </div>
    );
};

export default SoloMuteButtons;
