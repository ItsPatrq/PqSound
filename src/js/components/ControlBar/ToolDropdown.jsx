import React from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import {tools} from 'constants/Constants';

const ToolDropdown = (props) => {
    let toolsMenuItems = new Array;
    let secoundaryToolsMenuITems = new Array;
    for (let property in tools) {
        if (tools.hasOwnProperty(property)) {
            toolsMenuItems.push(
                <MenuItem
                    key={(tools[property].id + 1).toString()}
                    eventKey={(tools[property].id + 1).toString()}
                    onClick={() => props.onToolChange(tools[property].id)}>{tools[property].name}
                </MenuItem>
            );
            secoundaryToolsMenuITems.push(
                <MenuItem
                    key={(tools[property].id + 1).toString()}
                    eventKey={(tools[property].id + 1).toString()}
                    onClick={() => props.onSecoundaryToolChange(tools[property].id)}>{tools[property].name}
                </MenuItem>
            );
        }
    }
    let getToolName = (id) => {
        for(let property in tools) {
            if(tools[property].id === id){
                return tools[property].name
            }
        }

    }
    return (
        <div className="toolsContainer">
            <DropdownButton bsStyle="link" className="toolInput" title={getToolName(props.tool)} id="leftClickTools" >
                {toolsMenuItems}
            </DropdownButton>
            <DropdownButton bsStyle="link" className="toolInput" title={getToolName(props.secoundaryTool)} id="altClickTools" >
                {secoundaryToolsMenuITems}
            </DropdownButton>
            <div className="toolDropdownLabel">
                Tools
            </div>
        </div>
    )
}
export default ToolDropdown;