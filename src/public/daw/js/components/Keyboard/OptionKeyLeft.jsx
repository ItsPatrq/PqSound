import * as React from 'react';
import { Button } from 'react-bootstrap';
import { ChevronLeft } from 'react-bootstrap-icons';

const OptionKeyLeft = (props) => {
    return (
        <div className="optionKey left">
            <div className="shiftKeyDiv">
                <Button
                    className="shiftKeyDiv"
                    size="lg"
                    variant="link"
                    onClick={() => {
                        props.onChangeKeyboardRange(-1);
                    }}
                >
                    <ChevronLeft />
                </Button>
            </div>
            <div className="shiftKeyDiv">
                <Button
                    className="shiftKeyDiv"
                    size="lg"
                    variant="link"
                    onClick={() => {
                        props.onChangeKeyboardRange(-12);
                    }}
                >
                    <ChevronLeft />
                    <ChevronLeft />
                </Button>
            </div>
        </div>
    );
};

export default OptionKeyLeft;
