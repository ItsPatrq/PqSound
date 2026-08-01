export default function reducer(
    state = {
        showInstrumentModal: false,
        showPluginModal: false,
        selectedPluginIndex: null,
        selectedPluginTrackIndex: null,
    },
    action,
) {
    switch (action.type) {
        case 'INSTRUMENT_MODAL_VISIBILITY_SWITCH': {
            return {
                ...state,
                // undefined payload = toggle; explicit true/false = set.
                showInstrumentModal: action.payload === undefined ? !state.showInstrumentModal : action.payload,
            };
        }
        case 'PLUGIN_MODAL_VISIBILITY_SWITCH': {
            return {
                ...state,
                showPluginModal: !state.showPluginModal,
                selectedPluginIndex: action.payload.selectedPluginIndex,
                selectedPluginTrackIndex: action.payload.selectedPluginTrackIndex,
            };
        }
    }

    return state;
}
