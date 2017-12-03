export default function reducer(state = {
    showInstrumentModal: false
}, action) {
    switch (action.type) {
        case 'INSTRUMENT_MODAL_VISIBILITY_SWITCH':{
            return {
                ...state,
                showInstrumentModal: !state.showInstrumentModal
            }
        }
    }

    return state;
}