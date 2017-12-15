import Store from '../stroe';
import { updateMidiController } from 'actions/controlActions';

class MIDIController {
    constructor() {
        this.devices = {
            input: new Array,
            output: new Array
        }
        this.MIDISupported = false;
    }

    init() {
        if (window.navigator && 'function' === typeof window.navigator.requestMIDIAccess) {
            return window.navigator.requestMIDIAccess().then(this.connectCallBack.bind(this), this.onMIDIFailure.bind(this));
        } else {
            this.MIDISupported = false;
            console.log('Your browser doesn\'t support WebMIDI API.');
            Store.dispatch(updateMidiController(this));
        }
    }
    connectCallBack(access) {
        this.MIDISupported = true;
        this.midiAccess = access;
        if ('function' === typeof access.inputs) {
            // deprecated
            this.devices.input = access.inputs();
            console.error('Update your Chrome version!');
        } else {
            if (access.inputs && access.inputs.size > 0) {
                let inputs = access.inputs.values(),
                    input = null;

                // iterate through the devices
                for (input = inputs.next(); input && !input.done; input = inputs.next()) {
                    this.devices.input.push(input.value);
                }
            } else {
                this.devices.input = new Array;
                console.error('No input devices detected!');
            }
            if (access.outputs && access.outputs.size > 0) {
                let outputs = access.outputs.values(),
                    output = null;

                // iterate through the devices
                for (output = outputs.next(); output && !output.done; output = outputs.next()) {
                    this.devices.output.push(output.value);
                }
            } else {
                this.devices.output = new Array;
                console.error('No output devices detected!');
            }
        }
        access.onstatechange = this.onMidiStateChange.bind(this);
        Store.dispatch(updateMidiController(this));
    }
    onMIDIFailure(e) {
        this.MIDISupported = false;
        console.log('Your browser doesn\'t support WebMIDI API.' + e);
        Store.dispatch(updateMidiController(this));
    }

    onMidiStateChange = (e) => {
        // Print information about the (dis)connected MIDI controller
        console.log('MIDI state changed', e.port.name, e.port.manufacturer, e.port.state);
        this.updateDevices();
    };

    updateDevices(){
        this.devices.input = new Array;
        this.devices.output = new Array;

        if ('function' === typeof this.midiAccess.inputs) {
            // deprecated
            this.devices.input = this.midiAccess.inputs();
            console.error('Update your Chrome version!');
        } else {
            if (this.midiAccess.inputs && this.midiAccess.inputs.size > 0) {
                let inputs = this.midiAccess.inputs.values(),
                    input = null;

                // iterate through the devices
                for (input = inputs.next(); input && !input.done; input = inputs.next()) {
                    this.devices.input.push(input.value);
                }
            } else {
                this.devices.input = new Array;
                console.error('No input devices detected!');
            }
            if (this.midiAccess.outputs && this.midiAccess.outputs.size > 0) {
                let outputs = this.midiAccess.outputs.values(),
                    output = null;

                // iterate through the devices
                for (output = outputs.next(); output && !output.done; output = outputs.next()) {
                    this.devices.output.push(output.value);
                }
            } else {
                this.devices.output = new Array;
                console.error('No output devices detected!');
            }
        }
        Store.dispatch(updateMidiController(this));
    }
}

export default MIDIController;