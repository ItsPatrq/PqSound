import * as React from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';

const MIDIDeviceSelector = (props) => {
    const availableDevices = [];
    availableDevices.push(
        <Dropdown.Item
            key="selectNoneMidiDevice"
            eventKey="selectNoneMidiDevice"
            onClick={() => {
                props.onDeviceChange(null);
            }}
        >
            None
        </Dropdown.Item>,
    );
    const isEnabled = props.devices.length > 0;
    for (let i = 0; i < props.devices.length; i++) {
        availableDevices.push(
            <Dropdown.Item
                key={props.devices[i].id}
                eventKey={props.devices[i].id}
                onClick={() => {
                    props.onDeviceChange(props.devices[i].id);
                }}
            >
                {props.devices[i].name}
            </Dropdown.Item>,
        );
    }
    return (
        <div className="midiDeviceSelectorBox">
            <div className="midiDeviceSelectorName">MIDI device</div>
            <DropdownButton
                disabled={!isEnabled}
                variant="link"
                className="drop-down midiDeviceSelectorDropDown"
                title={props.dropDownTitle}
                id="MidiDeviceSelectorDropDown"
            >
                {availableDevices}
            </DropdownButton>
        </div>
    );
};

export default MIDIDeviceSelector;
