import * as types from '../actions/project';

const initialState = {
    projectSearchVal: {}
};

export default function project(state = initialState, action = {}) {
    switch (action.type) {
        case types.PROJECT_SEARCH:
            return Object.assign({}, state, { projectSearchVal: action.payload });   
        default:
            return state;
    }
}