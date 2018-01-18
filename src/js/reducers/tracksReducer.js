import * as Utils from 'engine/Utils';
import Sound from 'engine/Sound';
import Track from 'engine/Track';
import { Sampler, Utils as InstrumentsUtils } from 'instruments';
import { Utils as PluginsUtils } from 'plugins';
import { TrackTypes } from 'constants/Constants';
import { Utils as SamplerPresetsUtils, Presets as SamplerPresets } from 'constants/SamplerPresets';
/**
 * Those let-s are for initializing purpose
 */
let newMasterPluginList = new Array;
let newTrackPluginList = new Array;
let firstInstrument = new Sampler(SamplerPresetsUtils.getPresetById(SamplerPresets.DSKGrandPiano.id));
export default function reducer(state = {
    trackList: [
        {
            name: 'Master',
            trackType: TrackTypes.aux,
            pluginList: newMasterPluginList,
            volume: 1.0,
            pan: 0,
            record: false,
            mute: false,
            index: 0,
            output: null, //output: context.destination
            input: [1],
            trackNode: new Track(newMasterPluginList)
        },
        {
            name: 'Piano',
            trackType: TrackTypes.virtualInstrument,
            instrument: firstInstrument,
            pluginList: newTrackPluginList,
            volume: 1.0,
            pan: 0,
            record: true,
            mute: false,
            solo: false,
            index: 1,
            output: 0,
            input: new Array,
            trackNode: new Track(newTrackPluginList, firstInstrument, 0)
        }],
    selected: 1,
    anyVirtualInstrumentSolo: false,
    anyAuxSolo: false,
    showAddNewTrackModal: false
}, action) {
    switch (action.type) {
        case 'ADD_TRACK': {
            let newTrackList = [...state.trackList];
            let newPluginList = new Array;
            newTrackList[0].input.push(state.trackList.length);
            let newInstrument = action.payload.trackType === TrackTypes.virtualInstrument ?
                new Sampler(SamplerPresetsUtils.getPresetById(SamplerPresets.DSKGrandPiano.id)) : null;
            newTrackList.push(
                {
                    name: 'Default',
                    trackType: action.payload.trackType,
                    instrument: newInstrument,
                    pluginList: newPluginList,
                    volume: 1.0,
                    pan: 0,
                    record: false,
                    mute: false,
                    solo: false,
                    index: state.trackList.length,
                    output: 0,
                    input: new Array,
                    trackNode: new Track(newPluginList, newInstrument, 0, 1.0, 0)
                }
            );
            if(action.payload.trackType === TrackTypes.virtualInstrument){
                if(state.anyAuxSolo){
                    newTrackList[newTrackList.length - 1].trackNode.updateSoloState(false, true);
                } else {
                    newTrackList[newTrackList.length - 1].trackNode.updateSoloState(false, state.anyVirtualInstrumentSolo);
                }
            } else if(action.payload.trackType === TrackTypes.aux){
                newTrackList[newTrackList.length - 1].trackNode.updateSoloState(false, state.anyAuxSolo);
            }
            return {
                ...state,
                trackList: newTrackList
            }
        }
        case 'REMOVE_TRACK': {
            let newTrackList = [...state.trackList];
            let selected = state.selected;
            for (let i = 1; i < newTrackList.length; i++) {
                if (newTrackList[i].index === action.payload) {
                    if (newTrackList[i].index === selected) {
                        selected = newTrackList[i].index === newTrackList.length - 1 ?
                            --selected : selected;
                    }
                    let currOutput = Utils.getTrackByIndex(newTrackList, newTrackList[i].output);
                    for(let j = 0; j < newTrackList[i].input.length; j++){
                        Utils.getTrackByIndex(newTrackList, newTrackList[i].input[j]).output = newTrackList[i].output;
                        currOutput.input.push(newTrackList[i].input[j]);
                    }
                    for(let j = 0; j < currOutput.input.length; j++){
                        if(currOutput.input[j] === action.payload){
                            currOutput.input.splice(j, 1);
                            break;
                        }
                    }
                    newTrackList.splice(i, 1);
                    for (let j = i; j < newTrackList.length; j++) {
                        for(let k = 0; k < newTrackList[j].input.length; k++){
                            Utils.getTrackByIndex(newTrackList, newTrackList[j].input[k]).output = j;
                        }
                        if(selected === newTrackList[j].index){
                            selected = j;
                        }
                        newTrackList[j].index = j;
                    }
                    for(let j = 0; j < newTrackList.length; j++){
                        for(let k = 0; k < newTrackList[j].input.length; k++){
                            if(newTrackList[j].input[k] >= i){
                                newTrackList[j].input[k]++;
                            }
                        }
                    }
                    break;
                }
            }
            return {
                ...state,
                trackList: newTrackList,
                selected: selected
            }
        }
        case 'CHANGE_RECORD_STATE': {
            let newTrackList = [...state.trackList];
            for (let i = 0; i < newTrackList.length; i++) {
                if (newTrackList[i].index === action.payload) {
                    newTrackList[i].record = !newTrackList[i].record;
                }
            }
            return {
                ...state,
                trackList: newTrackList
            }
        }
        case 'CHANGE_TRACK_SOLO_STATE': {
            let newTrackList = [...state.trackList];
            let newAnyVirtualInstrumentSolo = false;
            let newAnyAuxSolo = false;
            for (let i = 1; i < newTrackList.length; i++) {
                if (newTrackList[i].index === action.payload) {
                    newTrackList[i].solo = !newTrackList[i].solo;
                }
                if (newTrackList[i].solo) {
                    if (newTrackList[i].trackType === TrackTypes.virtualInstrument) {
                        newAnyVirtualInstrumentSolo = true;
                    } else if (newTrackList[i].trackType === TrackTypes.aux) {
                        newAnyAuxSolo = true;
                    }
                }
            }
            for (let i = 1; i < newTrackList.length; i++) {
                if (newTrackList[i].trackType === TrackTypes.virtualInstrument) {
                    if (newAnyAuxSolo && newTrackList[i].output === 0) {
                        newTrackList[i].trackNode.updateSoloState(false, true);
                    } else {
                        newTrackList[i].trackNode.updateSoloState(newTrackList[i].solo, newAnyVirtualInstrumentSolo);
                    }
                } else if (newTrackList[i].trackType === TrackTypes.aux) {
                    newTrackList[i].trackNode.updateSoloState(newTrackList[i].solo, newAnyAuxSolo);
                }

            }
            return {
                ...state,
                trackList: newTrackList,
                anyVirtualInstrumentSolo: newAnyVirtualInstrumentSolo,
                anyAuxSolo: newAnyAuxSolo
            }
        }
        case 'CHANGE_TRACK_MUTE_STATE': {
            let newTrackList = [...state.trackList];
            for (let i = 0; i < newTrackList.length; i++) {
                if (newTrackList[i].index === action.payload) {
                    newTrackList[i].mute = !newTrackList[i].mute;
                    newTrackList[i].trackNode.updateMuteState();
                    break;
                }
            }
            return {
                ...state,
                trackList: newTrackList
            }
        }
        case 'CHANGE_TRACK_NAME': {
            let newTrackList = [...state.trackList];
            for (let i = 0; i < newTrackList.length; i++) {
                if (newTrackList[i].index === action.payload.index) {
                    newTrackList[i].name = action.payload.newTrackName;
                }
            }
            return {
                ...state,
                trackList: newTrackList
            }
        }
        case 'CHANGE_SELECTED_TRACK': {
            let newTrackList = [...state.trackList];
            let recording = 0;
            for(let i = 0; i < newTrackList.length; i++){
                if(newTrackList[i].record){
                    recording++;
                }
            }
            if(recording === 1){
                for(let i = 0; i < newTrackList.length; i++){
                    if(newTrackList[i].record){
                        newTrackList[i].record = false;
                    }
                    if(newTrackList[i].index === action.payload){
                        newTrackList[i].record = true;
                    }
                }
            } else {
                for(let i = 0; i < newTrackList.length; i++){
                    if(newTrackList[i].index === action.payload){
                        newTrackList[i].record = true;
                    }
                }
            }
            return {
                ...state,
                trackList: newTrackList,
                selected: action.payload
            }
        }
        case 'INIT_TRACK_SOUND': {
            let newTrackList = [...state.trackList];
            if (Utils.isNullOrUndefined(action.payload)) {
                newTrackList[newTrackList.length - 1].sound = new Sound(newTrackList.length - 1);
            } else {
                for (let i = 0; i < newTrackList.length; i++) {
                    if (newTrackList[i].index === action.payload) {
                        newTrackList[i].sound = new Sound(action.payload);
                    }
                }
            }
            return {
                ...state,
                trackList: newTrackList
            }
        }
        case 'INIT_INSTRUMENT_CONTEXT': {
            let newTrackList = [...state.trackList];
            if (Utils.isNullOrUndefined(action.payload)) {
                newTrackList[newTrackList.length - 1].instrument.initContext();
                newTrackList[newTrackList.length - 1].trackNode.initContext();
                newTrackList[0].trackNode.initContext();
            } else {
                for (let i = 0; i < newTrackList.length; i++) {
                    if (newTrackList[i].index === action.payload) {
                        newTrackList[0].trackNode.initContext();
                        newTrackList[i].instrument.initContext();
                        newTrackList[i].trackNode.initContext();
                    }
                }
            }
            return {
                ...state,
                trackList: newTrackList
            }
        }
        case 'CHANGE_TRACK_VOLUME': {
            let newTrackList = [...state.trackList];
            for (let i = 0; i < newTrackList.length; i++) {
                if (newTrackList[i].index === action.payload.index) {
                    newTrackList[i].volume = action.payload.volume;
                    newTrackList[i].trackNode.changeVolume(action.payload.volume);
                }
            }
            return {
                ...state,
                trackList: newTrackList
            }
        }
        case 'CHANGE_TRACK_PAN': {
            let newTrackList = [...state.trackList];
            for (let i = 0; i < newTrackList.length; i++) {
                if (newTrackList[i].index === action.payload.index) {
                    newTrackList[i].pan = action.payload.pan;
                    newTrackList[i].trackNode.changePan(action.payload.pan);
                }
            }
            return {
                ...state,
                trackList: newTrackList
            }
        }
        case 'CHANGE_TRACK_INSTRUMENT': {
            let newTrackList = [...state.trackList];
            for (let i = 0; i < newTrackList.length; i++) {
                if (newTrackList[i].index === action.payload.index) {
                    let newInstrument = InstrumentsUtils.getNewInstrumentByIndex(action.payload.trackInstrumentId);
                    newTrackList[i].instrument = newInstrument;
                    newTrackList[i].trackNode.updateInstrument(newInstrument);
                    break;
                }
            }
            return {
                ...state,
                trackList: newTrackList
            }
        }
        case 'CHANGE_TRACK_OUTPUT': {
            let newTrackList = [...state.trackList];
            for (let i = 0; i < newTrackList.length; i++) {
                if (newTrackList[i].index === action.payload.index) {
                    let currOutput = Utils.getTrackByIndex(newTrackList, newTrackList[i].output);
                    for(let j = 0; j < currOutput.input.length; j++){
                        if(currOutput.input[j] === action.payload.index){
                            currOutput.input.splice(j, 1);
                            break;
                        }
                    }
                    newTrackList[i].output = action.payload.outputIndex;
                    Utils.getTrackByIndex(newTrackList, action.payload.outputIndex).input.push(action.payload.index);
                    newTrackList[i].trackNode.updateTrackNode(action.payload.outputIndex);
                    break;
                }
            }
            return {
                ...state,
                trackList: newTrackList
            }
        }
        case 'ADD_NEW_TRACK_MODAL_VISIBILITY_SWITCH': {
            return {
                ...state,
                showAddNewTrackModal: !state.showAddNewTrackModal
            }
        }
        case 'UPDATE_INSTRUMENT_PRESET': {
            let newTrackList = [...state.trackList];
            for (let i = 0; i < newTrackList.length; i++) {
                if (newTrackList[i].index === action.payload.index) {
                    newTrackList[i].instrument.updatePreset(action.payload.preset);
                    break;
                }
            }
            return {
                ...state,
                trackList: newTrackList
            }
        }
        case 'TRACK_INDEX_UP': {
            let newTrackList = [...state.trackList];
            for (let i = 0; i < newTrackList.length; i++) {
                if (newTrackList[i].index === action.payload) {
                    for(let j = 0; j < newTrackList[i].input.length; j++){
                        Utils.getTrackByIndex(newTrackList, newTrackList[i].input[j]).output++;
                    }
                    let currOutput = Utils.getTrackByIndex(newTrackList, newTrackList[i].output);
                    for(let j = 0; j < currOutput.input.length; j++){
                        if(currOutput.input[j] === newTrackList[i].index){
                            currOutput.input[j]++;
                            break;
                        }
                    }
                    ++newTrackList[i].index;
                } else if (newTrackList[i].index === action.payload + 1) {
                    for(let j = 0; j < newTrackList[i].input.length; j++){
                        Utils.getTrackByIndex(newTrackList, newTrackList[i].input[j]).output--;
                    }
                    let currOutput = Utils.getTrackByIndex(newTrackList, newTrackList[i].output);
                    for(let j = 0; j < currOutput.input.length; j++){
                        if(currOutput.input[j] === newTrackList[i].index){
                            currOutput.input[j]--;
                            break;
                        }
                    }
                    --newTrackList[i].index;
                }
            }
            newTrackList.sort((a, b) => { return a.index - b.index });
            return {
                ...state,
                trackList: newTrackList
            }
        }
        case 'TRACK_INDEX_DOWN': {
            let newTrackList = [...state.trackList];
            for (let i = 0; i < newTrackList.length; i++) {
                if (newTrackList[i].index === action.payload) {
                    for(let j = 0; j < newTrackList[i].input.length; j++){
                        Utils.getTrackByIndex(newTrackList, newTrackList[i].input[j]).output--;
                    }
                    let currOutput = Utils.getTrackByIndex(newTrackList, newTrackList[i].output);
                    for(let j = 0; j < currOutput.input.length; j++){
                        if(currOutput.input[j] === newTrackList[i].index){
                            currOutput.input[j]--;
                            break;
                        }
                    }
                    --newTrackList[i].index;
                } else if (newTrackList[i].index === action.payload - 1) {
                    for(let j = 0; j < newTrackList[i].input.length; j++){
                        Utils.getTrackByIndex(newTrackList, newTrackList[i].input[j]).output++;
                    }
                    let currOutput = Utils.getTrackByIndex(newTrackList, newTrackList[i].output);
                    for(let j = 0; j < currOutput.input.length; j++){
                        if(currOutput.input[j] === newTrackList[i].index){
                            currOutput.input[j]++;
                            break;
                        }
                    }
                    ++newTrackList[i].index;
                }
            }
            newTrackList.sort((a, b) => { return a.index - b.index });
            return {
                ...state,
                trackList: newTrackList
            }
        }
        case 'ADD_NEW_PLUGIN': {
            let newTrackList = [...state.trackList];
            let currTrack = Utils.getTrackByIndex(newTrackList, action.payload.index);
            currTrack.pluginList.push(
                PluginsUtils.getNewPluginByIndex(action.payload.pluginId, currTrack.pluginList.length)
            );
            currTrack.trackNode.updateTrackNode();
            return {
                ...state,
                trackList: newTrackList
            }
        }
        case 'REMOVE_PLUGIN': {
            let newTrackList = [...state.trackList];
            let currTrack = Utils.getTrackByIndex(newTrackList, action.payload.index);
            for (let i = 0; i < currTrack.pluginList.length; i++) {
                if (currTrack.pluginList[i].index === action.payload.pluginIndex) {
                    currTrack.pluginList.splice(i, 1);
                    for (let j = i; j < currTrack.pluginList.length; j++) {
                        currTrack.pluginList[j].index = j;
                    }
                    break;
                }
            }
            currTrack.trackNode.updateTrackNode();
            return {
                ...state,
                trackList: newTrackList
            }
        }
        case 'CHANGE_PLUGIN_PRESET': {
            let newTrackList = [...state.trackList];
            let currTrack = Utils.getTrackByIndex(newTrackList, action.payload.index);
            for (let i = 0; i < currTrack.pluginList.length; i++) {
                if (currTrack.pluginList[i].index === action.payload.pluginIndex) {
                    currTrack.pluginList[i].updatePreset(action.payload.preset);
                    break;
                }
            }
            return {
                ...state,
                trackList: newTrackList
            }
        }
        case 'LOAD_TRACK_STATE': {
            let newState = Utils.copy(action.payload);
            for (let i = 1; i < newState.trackList.length; i++) {
                if (newState.trackList[i].trackType === TrackTypes.virtualInstrument) {
                    let newInstrument = InstrumentsUtils.getNewInstrumentByIndex(action.payload.trackList[i].instrument.id);
                    newInstrument.updatePreset(action.payload.trackList[i].instrument.preset);
                    newState.trackList[i].instrument = newInstrument;
                    let newPluginList = new Array;
                    for (let j = 0; j < newState.trackList[i].pluginList.length; j++) {
                        newPluginList.push(
                            PluginsUtils.getNewPluginByIndex(newState.trackList[i].pluginList[j].id, newPluginList.length)
                        );
                    }
                    newState.trackList[i].pluginList = newPluginList;
                    for (let j = 0; j < newState.trackList[i].pluginList.length; j++) {
                        newState.trackList[i].pluginList[j].updatePreset(action.payload.trackList[i].pluginList[j].preset);
                    }
                    newState.trackList[i].trackNode = new Track(newState.trackList[i].pluginList, newState.trackList[i].instrument, newState.trackList[i].output, newState.trackList[i].volume, newState.trackList[i].pan)
                } else {
                    let newPluginList = new Array;
                    for (let j = 0; j < newState.trackList[i].pluginList.length; j++) {
                        newPluginList.push(
                            PluginsUtils.getNewPluginByIndex(newState.trackList[i].pluginList[j].id, newPluginList.length)
                        );
                    }
                    newState.trackList[i].pluginList = newPluginList;
                    for (let j = 0; j < newState.trackList[i].pluginList.length; j++) {
                        newState.trackList[i].pluginList[j].updatePreset(action.payload.trackList[i].pluginList[j].preset);
                    }
                    newState.trackList[i].trackNode = new Track(
                        newState.trackList[i].pluginList, null, newState.trackList[i].output, newState.trackList[i].volume, newState.trackList[i].pan)
                }
                newState.trackList[i].index = newState.trackList[i].index;
            }
            let newPluginList = new Array;
            for (let j = 0; j < newState.trackList[0].pluginList.length; j++) {
                newPluginList.push(
                    PluginsUtils.getNewPluginByIndex(newState.trackList[0].pluginList[j].id, newPluginList.length)
                );
            }
            newState.trackList[0].pluginList = newPluginList;
            for (let j = 0; j < newState.trackList[0].pluginList.length; j++) {
                newState.trackList[0].pluginList[j].updatePreset(action.payload.trackList[0].pluginList[j].preset);
            }
            newState.trackList[0].trackNode = state.trackList[0].trackNode;
            newState.trackList[0].trackNode.pluginNodeList = newPluginList;
            newState.trackList[0].trackNode.updateTrackNode();
            
            return {
                ...newState
            }
        }
        case 'UPDATE_ALL_TRACK_NODES': {
            let newTrackList = [...state.trackList];
            
            for(let i = 0; i < newTrackList.length; i++){
                if(newTrackList[i].mute){
                    newTrackList[i].trackNode.updateMuteState();
                }
                if (newTrackList[i].trackType === TrackTypes.virtualInstrument) {
                    if (state.anyAuxSolo && newTrackList[i].output === 0) {
                        newTrackList[i].trackNode.updateSoloState(false, true);
                    } else {
                        newTrackList[i].trackNode.updateSoloState(newTrackList[i].solo, state.anyVirtualInstrumentSolo);
                    }
                } else if (newTrackList[i].trackType === TrackTypes.aux) {
                    newTrackList[i].trackNode.updateSoloState(newTrackList[i].solo, state.anyAuxSolo);
                }
            }
            return {
                ...state,
                trackList: newTrackList
            }
        }
    }
    return state;
}