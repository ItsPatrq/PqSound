import React from 'react';
import { ButtonToolbar, MenuItem, SplitButton } from 'react-bootstrap';
import { instruments } from 'engine/Constants';
import InstrumentModal from './InstrumentModal';

const InstrumentInput = (props) => {
    let availableInstruments = new Array;
    for (let property in instruments) {
        if (instruments.hasOwnProperty(property)) {
            availableInstruments.push(
                <MenuItem
                    key={(instruments[property].id + 1).toString()}
                    eventKey={(instruments[property].id + 1).toString()}
                    onClick={() => { console.log('TODO') }}
                >
                    {instruments[property].name}
                </MenuItem>
            );
        }
    }

    return (
        <ButtonToolbar className="instrumentInput">
            <SplitButton bsStyle="info" title={props.selectedTrack.instrument.name} id="split-button-instrument-input" onClick={() => props.instrumentModalVisibilitySwitch()}>
                {availableInstruments}
            </SplitButton>
            <InstrumentModal
                modalVisibilitySwitch={props.instrumentModalVisibilitySwitch}
                showModal={props.showModal}
                track={props.selectedTrack}
            />
        </ButtonToolbar>
    );
}

export default InstrumentInput;