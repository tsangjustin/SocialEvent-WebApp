import { EventRecord } from "../record/event";

export interface EventStoreState {
  isLoaded: boolean,
  events: EventRecord[],
}

const defaultState: EventStoreState = {
  isLoaded: false,
  events: [],
};

export const events = (
  state: EventStoreState = defaultState,
  action
) => {
  switch (action.type) {
    case "LOAD_EVENTS": {
      return {
        ...state,
        isLoaded: true,
        events: action.payload.events,
      };
    }
    case "CREATE_EVENT":
      return {
        ...state,
        events: [action.payload.event, ...state.events]
      };
    case "UPDATE_EVENT":
      const updateIndex = state.events
        .findIndex(e => e._id === action.payload.event._id);
      state.events[updateIndex] = action.payload.event;
      return {
        ...state,
      };
    case "DELETE_EVENT":
      const currEvents = [...state.events]
        .filter(e => e._id !== action.payload.eventId);
      return {
        ...state,
        events: currEvents,
      };
    case "FETCH_ALL_COMMENTS":
      const events = [...state.events];
      const updateIdx = events.findIndex(e => e._id === action.payload.eventId);
      if (updateIdx < 0) {
        return {
          ...state,
        };
      } else {
        events[updateIdx] = {
          ...events[updateIdx],
          comments: action.payload.comments,
        }
        return {
          ...state,
          events: events,
        };
      }
    default:
      return state;
  }
}
