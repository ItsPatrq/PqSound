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
                showInstrumentModal: !state.showInstrumentModal,
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
