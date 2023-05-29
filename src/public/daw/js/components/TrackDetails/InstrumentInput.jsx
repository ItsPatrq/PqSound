import * as React from 'react';
import { MenuItem, DropdownButton } from 'react-bootstrap';
import { Instruments } from 'constants/Constants';
import InstrumentModal from './InstrumentModal';
import Loader from 'react-loader-spinner';

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
            <div className="instrumentDetailsInput">
                <div className="selectedInstrument">
                    <DropdownButton
                        bsStyle="link"
                        title=""
                        className="drop-down outputSelectorDropDown"
                        id="OutputSelectorDropDown"
                    >
                        {availableInstruments}
                    </DropdownButton>
                    <p onClick={() => props.instrumentModalVisibilitySwitch()}>{props.selectedTrack.instrument.name}</p>
                </div>

                {props.isLoading && (
                    <div className="instrumentDetailsInput_loading">
                        <Loader type="Puff" color="#EFF8FF" height={20} width={20} />
                        <p>Loading samples</p>
                    </div>
                )}
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
