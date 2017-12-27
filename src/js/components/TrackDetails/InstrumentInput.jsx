import React from 'react';
import { ButtonToolbar, MenuItem, SplitButton } from 'react-bootstrap';
import { Instruments } from 'constants/Constants';
import InstrumentModal from './InstrumentModal';

const InstrumentInput = (props) => {
    let availableInstruments = new Array;
    for (let property in Instruments) {
        if (Instruments.hasOwnProperty(property)) {
            availableInstruments.push(
                <MenuItem
                    key={(Instruments[property].id + 1).toString()}
                    eventKey={(Instruments[property].id + 1).toString()}
                    onClick={() => { props.onInstrumentChange(Instruments[property].id) }}
                >
                    {Instruments[property].name}
                </MenuItem>
            );
        }
    }
    return (
        <div className="instrumentInputContainer">
            <ButtonToolbar className="instrumentInput">
                <SplitButton bsStyle="info" title={props.selectedTrack.instrument.name} id="split-button-instrument-input" onClick={() => props.instrumentModalVisibilitySwitch()}>
                    {availableInstruments}
                </SplitButton>
                <InstrumentModal
                    modalVisibilitySwitch={props.instrumentModalVisibilitySwitch}
                    showModal={props.showModal}
                    track={props.selectedTrack}
                    onSamplerPresetChange={props.onSamplerPresetChange}
                />
            </ButtonToolbar>
        </div>
    );
}

export default InstrumentInput;