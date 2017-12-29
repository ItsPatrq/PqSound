import React from 'react';
import AddNewPluginButton from 'components/TrackDetails/AddNewPluginButton';
import { Glyphicon } from 'react-bootstrap';

const PluginList = (props) => {
    let pluginList = new Array;
    for (let i = 0; i < props.pluginList.length; i++) {
        pluginList.push(
            <div className="pluginRow"
                key={i}>
                <div className="pluginRowName">
                    {props.pluginList[i].name}
                </div>
                <div className="pluginRowRemove"
                    onClick={() => {props.onPluginRemove(props.trackIndex, props.pluginList[i].index)}}>
                    <Glyphicon glyph="remove" />
                </div>
            </div>
        )
    }
    return (
        <div className="pluginList">
            <AddNewPluginButton onPluginAdd={props.onPluginAdd} trackIndex={props.trackIndex} />
            <div className="pluginRowList">
                {pluginList}
            </div>
        </div>
    );
}

export default PluginList;