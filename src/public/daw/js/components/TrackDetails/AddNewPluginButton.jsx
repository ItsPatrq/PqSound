import * as React from 'react';
import Dropdown from 'components/Dropdown';
import { Plugins } from 'constants/Constants';

const AddNewPluginButton = (props) => {
    const availablePlugins = [];
    for (let i = 0; i < Plugins.length; i++) {
        const id = Plugins[i].id;
        availablePlugins.push({
            key: id,
            label: Plugins[i].name,
            onClick: () => props.onPluginAdd(props.trackIndex, id),
        });
    }
    return (
        <div className="addNewPluginButton">
            <div style={{ margin: 'auto' }}>
                <Dropdown
                    items={availablePlugins}
                    className="drop-down outputSelectorDropDown"
                    title="Add new plugin"
                    id="OutputSelectorDropDown"
                />
            </div>
        </div>
    );
};

export default AddNewPluginButton;
