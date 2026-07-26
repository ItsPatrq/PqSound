import * as React from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { tools } from 'constants/Constants';

const ToolDropdown = (props) => {
    const toolsMenuItems = [];
    const secoundaryToolsMenuITems = [];
    for (const property in tools) {
        if (tools.hasOwnProperty(property)) {
            toolsMenuItems.push(
                <Dropdown.Item
                    key={(tools[property].id + 1).toString()}
                    eventKey={(tools[property].id + 1).toString()}
                    onClick={() => props.onToolChange(tools[property].id)}
                >
                    {tools[property].name}
                </Dropdown.Item>,
            );
            secoundaryToolsMenuITems.push(
                <Dropdown.Item
                    key={(tools[property].id + 1).toString()}
                    eventKey={(tools[property].id + 1).toString()}
                    onClick={() => props.onSecoundaryToolChange(tools[property].id)}
                >
                    {tools[property].name}
                </Dropdown.Item>,
            );
        }
    }
    const getToolName = (id) => {
        for (const property in tools) {
            if (tools[property].id === id) {
                return tools[property].name;
            }
        }
    };
    return (
        <div className="toolsContainer">
            <DropdownButton variant="link" className="toolInput" title={getToolName(props.tool)} id="leftClickTools">
                {toolsMenuItems}
            </DropdownButton>
            <DropdownButton
                variant="link"
                className="toolInput"
                title={getToolName(props.secoundaryTool)}
                id="altClickTools"
            >
                {secoundaryToolsMenuITems}
            </DropdownButton>
            <div className="toolDropdownLabel">Tools</div>
        </div>
    );
};
export default ToolDropdown;
