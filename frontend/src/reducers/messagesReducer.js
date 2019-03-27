// import {
//   FETCH_PROJECTS,
//   FETCH_PROJECTS_SUCCESS,
//   FETCH_PROJECT_ACTIONS,
//   FETCH_PROJECT_ACTIONS_SUCCESS,
//   REQUEST_ERROR
// } from '../actions';
import { MESSAGE_RECEIVED } from '../actions';

const initialState = [];

const addMessage = (state, action) => {

  if (state.length > 30) {
    return [...state.slice(state.length - 30), action.payload ];
  }

  return [...state, action.payload];
};

export const projectsReducer = (state = initialState, action) => {
  switch (action.type) {
    case MESSAGE_RECEIVED:
      return addMessage(state, action);
    default:
      return state;
  }
};

export default projectsReducer;
