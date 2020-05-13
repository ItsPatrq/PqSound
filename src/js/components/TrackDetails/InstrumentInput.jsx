import React from 'react';
import { MenuItem, DropdownButton } from 'react-bootstrap';
import { Instruments } from 'constants/Constants';
import InstrumentModal from './InstrumentModal';

const InstrumentInput = (props) => {
    const availableInstruments = [];
    for (const property in Instruments) {
        if (Instruments.hasOwnProperty(property)) {
            availableInstruments.push(
                <MenuItem
                    key={(Instruments[property].id + 1).toString()}
                    eventKey={(Instruments[property].id + 1).toString()}
                    onClick={() => {
                        props.onInstrumentChange(Instruments[property].id);
                    }}
                >
                    {Instruments[property].name}
                </MenuItem>,
            );
        }
    }
    return (
        <div className="instrumentInputContainer">
            <DropdownButton
                bsStyle="link"
                title=""
                className="drop-down outputSelectorDropDown"
                id="OutputSelectorDropDown"
            >
                {availableInstruments}
            </DropdownButton>
            <div className="instrumentDetailsInput" onClick={() => props.instrumentModalVisibilitySwitch()}>
                {props.selectedTrack.instrument.name}
            </div>

            <InstrumentModal
                modalVisibilitySwitch={props.instrumentModalVisibilitySwitch}
                showModal={props.showModal}
                track={props.selectedTrack}
                onSamplerPresetChange={props.onSamplerPresetChange}
                onInstrumentPresetChange={props.onInstrumentPresetChange}
            />
        </div>
    );
};

export default InstrumentInput;
