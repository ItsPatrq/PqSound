import React from 'react';

const WhiteKey = (props) => {
    return (
        <div className="blackKey" onMouseDown={props.onDown}></div>
    );
}

export default WhiteKey;