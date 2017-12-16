import Store from '../stroe';
import { updateMidiController, changeMidiDevice } from 'actions/controlActions';
import {addPlayingNote, removePlayingNote} from 'actions/keyboardActions';
import {isNullOrUndefined} from 'engine/Utils';
import { SoundOrigin } from 'constants/Constants';

class MIDIController {
    constructor() {
        this.devices = {
            input: new Array,
            output: new Array
        }
        this.MIDISupported = false;
        this.selectedInputDevice = null;
        this.selectedOutputDevice = null;
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
            console.log('Update your Chrome version!');
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
                console.log('No input devices detected!');
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
                console.log('No output devices detected!');
            }
        }
        access.onstatechange = this.onMidiStateChange.bind(this);
        Store.dispatch(updateMidiController(this));
        if(this.devices.input.length === 1){
            Store.dispatch(changeMidiDevice(this.devices.input[0].id));
        }
    }
    onMIDIFailure(e) {
        this.MIDISupported = false;
        console.log('Your browser doesn\'t support WebMIDI API.' + e);
        Store.dispatch(updateMidiController(this));
    }

    onMidiStateChange = (e) => {
        // Print information about the (dis)connected MIDI controller
        //console.log('MIDI state changed', e.port.name, e.port.manufacturer, e.port.state);
        this.updateDevices();
    };

    changeMidiDevice = (deviceId) => {
        if(isNullOrUndefined(deviceId)){
            if(!isNullOrUndefined(this.selectedInputDevice)){
                this.selectedInputDevice.onmidimessage = null;
            }
            this.selectedInputDevice = null;
        } else {
            if(!isNullOrUndefined(this.selectedInputDevice)){
                this.selectedInputDevice.onmidimessage = null;
            }
            for(let i = 0; i < this.devices.input.length; i++){
                if(deviceId === this.devices.input[i].id){
                    this.selectedInputDevice = this.devices.input[i];
                    this.selectedInputDevice.onmidimessage = this.handleMidiMessage.bind(this);
                }
            }
        }

        return this;
    }

    handleMidiMessage(event){
        let data = event.data,
        //cmd = data[0] >> 4,
        //channel = data[0] & 0xf,
        type = data[0] & 0xf0, // channel agnostic message type.
        note = data[1],
        velocity = data[2];
        // with pressure and tilt off
        // note off: 128, cmd: 8 
        // note on: 144, cmd: 9
        // pressure / tilt on
        // pressure: 176, cmd 11:
        // bend: 224, cmd: 14
        if(note > 20 && note < 109){
            switch (type) {
                //noteOn
                case 144: {
                    if(velocity > 0){
                        this.handleDown(note);
                    } else { //It seems like some MIDI controllers simply lower velocity to 0 and still send 144 status
                        this.handleUp(note);
                    }
                     break;
                }
                // noteOff
                case 128:{
                    this.handleUp(note);
                    break;
                }
            }
        }
        //console.log('data', data, 'cmd', cmd, 'channel', channel, 'type', type, 'note', note, 'velocity', velocity);
    }

    updateDevices(){
        this.devices.input = new Array;
        this.devices.output = new Array;

        if ('function' === typeof this.midiAccess.inputs) {
            // deprecated
            this.devices.input = this.midiAccess.inputs();
            console.error('Update your Chrome version, due to changes in Web MIDI Api');
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
                console.log('No input devices detected');
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
                
                console.log('No output devices detected');
            }
        }
        let inputExists = false;
        let outputExists = false;
        for(let i = 0; i < this.devices.input.length; i++){
            this.devices.input[i].onmidimessage = null;
            if(this.selectedInputDevice === this.devices.input[i]){
                inputExists = true;
            }
        }
        for(let i = 0; i < this.devices.output.length; i++){
            if(this.selectedOutputDevice === this.devices.output[i]){
                outputExists = true;
            }
        }
        this.selectedInputDevice = inputExists ? this.selectedInputDevice : null;
        this.selectedOutputDevice = outputExists ? this.selectedOutputDevice : null;
        if(!isNullOrUndefined(this.selectedInputDevice)){
            this.selectedInputDevice.onmidimessage = this.handleMidiMessage.bind(this);
        }

        Store.dispatch(updateMidiController(this));
    }

    getAllRecordingTracks() {
        let recordingTracksSounds = new Array;
        for (let i = 1; i < Store.getState().tracks.trackList.length; i++) {
            if (Store.getState().tracks.trackList[i].record) {
                recordingTracksSounds.push(Store.getState().tracks.trackList[i].index);
            }
        }
        return recordingTracksSounds;
    }

    handleUp(note) {
        if (Store.getState().keyboard.notesPlaying.includes(note)) {
            let recordingTracksSounds = this.getAllRecordingTracks();
            for (let i = 0; i < recordingTracksSounds.length; i++) {
                Store.getState().webAudio.sound.stop(recordingTracksSounds[i], note)
            }
            Store.dispatch(removePlayingNote(note));
        }
    }

    handleDown(note) {
        if(!Store.getState().keyboard.notesPlaying.includes(note)){
            let recordingTracksSounds = this.getAllRecordingTracks();
            for (let i = 0; i < recordingTracksSounds.length; i++) {
                Store.getState().webAudio.sound.play(recordingTracksSounds[i], null, note, SoundOrigin.pianoRollNote)
            }
            Store.dispatch(addPlayingNote(note))
        }
    }
}

export default MIDIController;