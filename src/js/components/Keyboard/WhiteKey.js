import React from 'react';

const WhiteKey = (props) => {
    return (
        <div className="whiteKey" onMouseDown={props.onDown}></div>
    );
}

export default WhiteKey;