import React from 'react';
import { MenuItem, DropdownButton } from 'react-bootstrap';
import {Plugins} from 'constants/Constants';

const AddNewPluginButton = (props) => {
    const availablePlugins = [];
    for (let i = 0; i < Plugins.length; i++) {
        availablePlugins.push(
            <MenuItem
                key={Plugins[i].id}
                eventKey={Plugins[i].id}
                onClick={() => { props.onPluginAdd(props.trackIndex, Plugins[i].id) }}
            >
                {Plugins[i].name}
            </MenuItem>
        );
    }
    return (

        <div className="addNewPluginButton">
            
            <div style={{margin: 'auto'}}>
                <DropdownButton
                    bsStyle="link"
                    className="drop-down outputSelectorDropDown"
                    title="Add new plugin"
                    id="OutputSelectorDropDown"
                >
                    {availablePlugins}
                </DropdownButton>
                </div>
        </div>
    );
}

export default AddNewPluginButton;