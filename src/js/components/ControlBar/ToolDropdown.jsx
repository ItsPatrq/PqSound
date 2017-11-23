import React from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import * as Utils from 'engine/Utils';

const ToolDropdown = (props) => {
    return (
        <DropdownButton bsStyle="default" className="drop-down" title="Tools" id={props.id} >
            <MenuItem eventKey="1" onClick={() => props.onToolChange(0)}>Draw</MenuItem>
            <MenuItem eventKey="2" onClick={() => props.onToolChange(1)}>Inspect</MenuItem>
        </DropdownButton>
    )
}
export default ToolDropdown;