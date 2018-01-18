import React from 'react';
import { MenuItem, DropdownButton } from 'react-bootstrap';
import { oscilatorTypes } from 'constants/Constants';


require('styles/Instruments/PqSynth.css');

const PqSynth = (props) => {
    let handleChange = () => {

    }
    let oscilators = new Array;
    for (let i = 0; i < 3; i++) {
        let shapeTypes = new Array;
        for (let j = 0; j < oscilatorTypes.length; j++) {
            shapeTypes.push(
                <MenuItem
                    key={'oscilator' + i + 'shape' + oscilatorTypes[j]}
                    eventKey={'oscilator' + i + 'shape' + oscilatorTypes[j]}
                    onClick={() => handleChange('todo')}
                >
                    {oscilatorTypes[j]}
                </MenuItem>
            )
        }
        shapeTypes.push(
            <MenuItem
                key={'oscilator' + i + 'shapenoise'}
                eventKey={'oscilator' + i + 'shapenoise'}
                onClick={() => handleChange('todo')}
            >
                {'noise'}
            </MenuItem>
        )
        oscilators.push(
            <div className="pqSynthOscilator" key={i.toString()}>
                <DropdownButton id={'oscilator-types-drop-down'} bsStyle="default" className="drop-down" title="todo" >
                    {shapeTypes}
                </DropdownButton>
            </div>
        )
    }
    return (
        <div className="pqSynthContainer">
            <div className="pqSynthOscilatorsContainer">
                {oscilators}
            </div>
        </div>
    );
}
export default PqSynth;