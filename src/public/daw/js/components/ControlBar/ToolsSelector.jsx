import * as React from 'react';
import ToolDropdown from 'components/ControlBar/ToolDropdown';
import NoteDrawLengthDropdown from 'components/ControlBar/NoteDrawLengthDropdown';
import RegionDrawLengthInput from 'components/ControlBar/RegionDrawLengthInput';

const ToolsSelector = (props) => {
    return (
        <div className="ToolsSelectorBox">
            <ToolDropdown
                onToolChange={props.handleToolChange}
                onSecoundaryToolChange={props.handleSecoundaryToolChange}
                tool={props.tool}
                secoundaryTool={props.secoundaryTool}
            />
            <NoteDrawLengthDropdown
                id={'noteDrawLength'}
                isVisible={props.pianoRollVIsible}
                onNoteDrawLengthChange={props.hangleNoteDrawLengthChange}
            />
            <RegionDrawLengthInput
                id={'regionDrawLength'}
                isVisible={!props.pianoRollVIsible}
                regionDrawLength={props.regionDrawLength}
                onRegionDrawLengthChange={props.handleRegionDrawLengthChange}
                onTempRegionDrawLengthChange={props.handleTempRegionDrawLengthChange}
            />
        </div>
    );
};
export default ToolsSelector;
