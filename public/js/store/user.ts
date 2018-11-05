import { UserRecord } from "../record/user";

export interface UserStoreState {
  user: UserRecord,
  allUsers: UserRecord[],
}

const defaultState: UserStoreState = {
  user: <UserRecord>{},
  allUsers: [],
};

export const user = (
  state: UserStoreState = defaultState,
  action
) => {
  switch (action.type) {
    case "LOGIN_USER":
      return {
        ...state,
        user: action.payload.user,
      };
    case "LOGOUT_USER":
      return {
        ...state,
        user: {},
      };
    case "SAVE_USER":
      return {
        ...state,
        user: action.payload.user,
      };
    case "FETCH_ALL_USERS":
      return {
        ...state,
        allUsers: action.payload.allUsers,
      };
    default:
      return state;
  }
}
