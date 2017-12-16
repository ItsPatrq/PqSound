import React from 'react';
import { MenuItem, DropdownButton } from 'react-bootstrap';

const MIDIDeviceSelector = (props) => {
    let availableDevices = new Array;
    availableDevices.push(
        <MenuItem
            key='selectNoneMidiDevice'
            eventKey='selectNoneMidiDevice'
            onClick={() => { props.onDeviceChange(null) }}
        >
            None
        </MenuItem>
    )
    let isEnabled = props.devices.length > 0;
    for (let i = 0; i < props.devices.length; i++) {
        availableDevices.push(
            <MenuItem
                key={props.devices[i].id}
                eventKey={props.devices[i].id}
                onClick={() => { props.onDeviceChange(props.devices[i].id) }}
            >
                {props.devices[i].name}
            </MenuItem>
        );
    }
    return (
        <div className="midiDeviceSelector">
            <p>MIDI device </p>
            <DropdownButton disabled={!isEnabled} bsStyle="default" className="drop-down" title={props.dropDownTitle} id="MidiDeviceSelectorDropDown" >
                {availableDevices}
            </DropdownButton>
        </div>
    );
}

export default MIDIDeviceSelector;