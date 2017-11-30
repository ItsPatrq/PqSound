import React from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import {tools} from 'engine/Constants';

const ToolDropdown = (props) => {
    let toolsMenuItems = new Array;
    for (let property in tools) {
        if (tools.hasOwnProperty(property)) {
            toolsMenuItems.push(
                <MenuItem
                    key={(tools[property].id + 1).toString()}
                    eventKey={(tools[property].id + 1).toString()}
                    onClick={() => props.onToolChange(tools[property].id)}>{tools[property].name}
                </MenuItem>
            );
        }
    }
    return (
        <DropdownButton bsStyle="default" className="drop-down" title="Tools" id={props.id} >
            {toolsMenuItems}
        </DropdownButton>
    )
}
export default ToolDropdown;