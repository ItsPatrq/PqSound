import React from 'react';
import { MenuItem, DropdownButton } from 'react-bootstrap';

const Output = (props) => {
    let availableAuxTracks = new Array;
    let isEnabled = props.auxTracks.length > 1;
    for (let i = 0; i < props.auxTracks.length; i++) {
        availableAuxTracks.push(
            <MenuItem
                key={props.auxTracks[i].index}
                eventKey={props.auxTracks[i].index}
                onClick={() => { props.onOutputChange(props.auxTracks[i].index) }}
            >
                {props.auxTracks[i].name}
            </MenuItem>
        );
    }
    return (
        <div className="output">
        <p> Output: </p>
            <DropdownButton disabled={!isEnabled} bsStyle="default" className="drop-down" title={props.dropDownTitle} id="OutputSelectorDropDown" >
                {availableAuxTracks}
            </DropdownButton>
        </div>
    );
}

export default Output;