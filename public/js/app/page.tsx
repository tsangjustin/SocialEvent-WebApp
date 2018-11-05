import * as React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Switch, Route } from "react-router-dom";

import { EventsApi } from "../api/events";
import { ProfileApi } from "../api/profile";
import { LoginPage } from "../auth/login-page";
import { SignUpPage } from "../auth/signup-page";
import { CreateEventPage } from "../event/create-event-page";
import { EventPage } from "../event/event-page";
import { NavBar } from "../home/nav";
import { HomePage } from "../home/page";
import { LoadingPage } from "../loading/page";
import { ProfilePage } from "../profile/profile-page";
import { ReduxStoreState } from "../store";

interface AppProps {
  fetchAllUsers: () => void;
  fetchProfile: () => void;
  isEventsLoaded: boolean;
  loadEvents: () => void;
}

class AppClass extends React.PureComponent<AppProps, undefined> {
  constructor(props: AppProps) {
    super(props);
  }

  componentWillMount() {
    const { fetchAllUsers, fetchProfile, loadEvents } = this.props;
    loadEvents();
    fetchProfile();
    fetchAllUsers();
  }

  render(): JSX.Element {
    const { isEventsLoaded } = this.props;
    if (!isEventsLoaded) {
      return (
        <LoadingPage />
      );
    }
    return (
      <div className="home-page">
        <NavBar />
        <Switch>
          <Route exact path="/app" component={HomePage}/>
          <Route exact path="/app/event/new" component={CreateEventPage} />
          <Route path='/app/event/:eventId/edit' component={CreateEventPage} />
          <Route path='/app/event/:eventId' component={EventPage} />
          <Route exact path="/app/login" component={LoginPage} />
          <Route exact path="/app/sign_up" component={SignUpPage} />
          <Route exact path="/app/profile" component={ProfilePage} />
        </Switch>
      </div>
    );
  }
}

function mapStateToProps(
  state: ReduxStoreState,
  currentProps: Partial<AppProps>
) {
  return {
    isEventsLoaded: state.events.isLoaded,
    ...currentProps,
  };
}

function mapDispatchToProps(dispatch: any, currentProps: Partial<AppProps>) {
  return {
    ...currentProps,
    dispatch: dispatch,
    fetchAllUsers: async () => {
      try {
        const allUsers = await ProfileApi.getAllUsers();
        dispatch({
          type: "FETCH_ALL_USERS",
          payload: {
            allUsers: allUsers,
          },
        });
      } catch (e) {
        console.error(e);
      }
    },
    loadEvents: async () => {
      try {
        const events = await EventsApi.getAllEvents();
        dispatch({
          type: "LOAD_EVENTS",
          payload: {
            events: events,
          },
        });
      } catch (e) {
        console.error(e);
      }
    },
    fetchProfile: async () => {
      try {
        const user = await ProfileApi.getProfile();
        dispatch({
          type: "LOGIN_USER",
          payload: {
            user: user,
          },
        });
      } catch (e) {
        console.error(e);
      }
    },
  };
}

export const App = withRouter(connect(
  mapStateToProps,
  mapDispatchToProps,
)(AppClass));