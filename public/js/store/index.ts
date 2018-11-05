import { combineReducers } from "redux"

import { events, EventStoreState } from "./events";
import { user, UserStoreState } from "./user";

export interface ReduxStoreState {
  events: EventStoreState;
  user: UserStoreState;
}

export const store = combineReducers({
  events,
  user,
});
