import React from 'react';

require('styles/Instruments/PqSynth.css');

const PqSynth = (props) => {
    let oscilators = new Array;
    for(let i = 0; i < 3; i++){
        
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