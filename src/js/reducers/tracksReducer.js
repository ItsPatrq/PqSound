import * as Utils from 'engine/Utils';
import Sound from 'engine/Sound';
import Track from 'engine/Track';
import { Sampler, Utils as InstrumentsUtils } from 'instruments';
import {TrackTypes} from 'constants/Constants';
import {Utils as SamplerPresetsUtils, Presets as SamplerPresets }  from 'constants/SamplerPresets';
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
            mute: false,
            index: 0,
            trackNode: new Track(newMasterPluginList)
            //output: context.destination
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
                        record: action.payload.trackType === TrackTypes.virtualInstrument ? false : null,
                        mute: false,
                        solo: false,
                        index: state.trackList.length,
                        output: 0,
                        trackNode: new Track(newPluginList, newInstrument, 0, 1.0, 0)
                    }
                );

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
                        selected = null
                    }
                    newTrackList.splice(i, 1);
                    for (let j = i; j < newTrackList.length; j++) {
                        newTrackList[j].index = j;
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
                if(newTrackList[i].solo){
                    if(newTrackList[i].trackType === TrackTypes.virtualInstrument){
                        newAnyVirtualInstrumentSolo = true;
                    } else if(newTrackList[i].trackType === TrackTypes.aux){
                        newAnyAuxSolo = true;
                    }
                }
            }
            for (let i = 1; i < newTrackList.length; i++) {
                if(newTrackList[i].trackType === TrackTypes.virtualInstrument){
                    if(newAnyAuxSolo && newTrackList[i].output === 0){
                        newTrackList[i].trackNode.updateSoloState(false, true);
                    } else {
                        newTrackList[i].trackNode.updateSoloState(newTrackList[i].solo, newAnyVirtualInstrumentSolo);
                    }
                } else if(newTrackList[i].trackType === TrackTypes.aux){
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
            return {
                ...state,
                selected: action.payload
            }
        }
        case 'CHANGE_TRACK_PRESET': {
            let newTrackList = [...state.trackList];
            for (let i = 0; i < newTrackList.length; i++) {
                if (newTrackList[i].index === action.payload.index) {
                    newTrackList[i].instrument.loadPreset(SamplerPresetsUtils.getPresetById(action.payload.presetId));
                }
            }
            return {
                ...state,
                trackList: newTrackList
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
        case 'INIT_INSTRUMENT_CONTEXT':{
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
        case 'CHANGE_TRACK_INSTRUMENT':{
            let newTrackList = [...state.trackList];
            for(let i = 0; i < newTrackList.length; i++){
                if(newTrackList[i].index === action.payload.index) {
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
        case 'CHANGE_TRACK_OUTPUT':{
            let newTrackList = [...state.trackList];
            for(let i = 0; i < newTrackList.length; i++){
                if(newTrackList[i].index === action.payload.index) {
                    newTrackList[i].output = action.payload.outputIndex;
                    newTrackList[i].trackNode.updateTrackNode(action.payload.outputIndex);
                    break;
                }
            }
            return {
                ...state,
                trackList: newTrackList
            }
        }
        case 'ADD_NEW_TRACK_MODAL_VISIBILITY_SWITCH':{
            return {
                ...state,
                showAddNewTrackModal: !state.showAddNewTrackModal
            }
        }
        case 'UPDATE_INSTRUMENT_PRESET':{
            let newTrackList = [...state.trackList];
            for(let i = 0; i < newTrackList.length; i++){
                if(newTrackList[i].index === action.payload.index) {
                    newTrackList[i].instrument.preset = action.payload.preset;
                    break;
                }
            }
            return {
                ...state,
                trackList: newTrackList
            }
        }
        case 'TRACK_INDEX_UP':{
            let newTrackList = [...state.trackList];
            for(let i = 0; i < newTrackList.length; i++){
                if(newTrackList[i].index === action.payload) {
                    ++newTrackList[i].index;
                } else if(newTrackList[i].index === action.payload + 1){
                    --newTrackList[i].index;
                }
            }
            return {
                ...state,
                trackList: newTrackList
            }
        }
        case 'TRACK_INDEX_DOWN':{
            let newTrackList = [...state.trackList];
            for(let i = 0; i < newTrackList.length; i++){
                if(newTrackList[i].index === action.payload) {
                    --newTrackList[i].index;
                } else if(newTrackList[i].index === action.payload - 1){
                    ++newTrackList[i].index;
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