import * as React from 'react';
import Dropdown from 'components/Dropdown';

const Output = (props) => {
    const availableAuxTracks = [];
    const isEnabled = props.auxTracks.length > 1;
    for (let i = 0; i < props.auxTracks.length; i++) {
        const index = props.auxTracks[i].index;
        availableAuxTracks.push({
            key: index,
            label: props.auxTracks[i].name,
            onClick: () => props.onOutputChange(index),
        });
    }
    return (
        <div className="output">
            <div style={{ margin: 'auto' }} title="Output AUX">
                <Dropdown
                    disabled={!isEnabled}
                    items={availableAuxTracks}
                    className="drop-down outputSelectorDropDown"
                    title={props.dropDownTitle}
                    id="OutputSelectorDropDown"
                />
            </div>
        </div>
    );
};

export default Output;
