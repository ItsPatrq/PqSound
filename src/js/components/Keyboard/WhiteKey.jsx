import React from 'react';

const WhiteKey = (props) => {
    let className;
    if (props.isPressed) {
        className = 'whiteKey pressed';
    } else {
        className = 'whiteKey';
    }
    const names = [];
    if (props.keyNameVisible) {
        names.push(
            <p className="keyName white" key={props.keyName + props.note}>
                {props.keyName}
            </p>,
        );
    }
    if (props.keyBindingVisible) {
        names.push(
            <p className="keyBind white" key={props.keyBind + props.note}>
                {props.keyBind}
            </p>,
        );
    }
    return (
        <div
            className={className}
            onMouseEnter={(event) => props.handleMouseOver(event, props.note)}
            onMouseDown={(event) => props.handleMouseOver(event, props.note)}
            onMouseLeave={(event) => props.handleMouseLeave(event, props.note)}
            onMouseUp={(event) => props.handleMouseLeave(event, props.note)}
        >
            {names}
        </div>
    );
};

export default WhiteKey;
