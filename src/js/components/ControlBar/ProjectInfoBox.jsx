import React from 'react';
import BPMInput from 'components/ControlBar/BPMInput';
import TimeSignature from 'components/ControlBar/TimeSignature';
import TimeMeter from 'components/ControlBar/TimeMeter';
import BarMeter from 'components/ControlBar/BarMeter';
import BarsInCompositionInput from 'components/ControlBar/BarsInCompositionInput';
const ProjectInfoBox = (props) => {
    return (
        <div className="projectInfoBox">
            <BarsInCompositionInput
                onBarsInCompositionChange={props.onBarsInCompositionChange}
                onTempBarsInCompositionChange={props.onTempBarsInCompositionChange}
                barsInComposition={props.barsInComposition}
                onInputFocusSwitch={props.onInputFocusSwitch}
            />
            <div className="projectInfoBoxBreak" />
            <BPMInput
                changeBPM={props.changeBPM}
                changeTempBPM={props.changeTempBPM}
                BPM={props.BPM}
                onInputFocusSwitch={props.onInputFocusSwitch}
            />
            <div className="projectInfoBoxBreak" />
            <TimeSignature />
            <div className="projectInfoBoxBreak" />
            <BarMeter currSixteenth={props.currSixteenth} />
            <div className="projectInfoBoxBreak" />
            <TimeMeter currSixteenth={props.currSixteenth} bpm={props.BPM} />
        </div>
    );
};
export default ProjectInfoBox;
