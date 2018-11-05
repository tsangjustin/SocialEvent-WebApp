import * as React from "react";
import { connect } from "react-redux";
import { Link, Redirect } from "react-router-dom";
import { classes, stylesheet } from "typestyle";

import { EventsApi } from "../api/events";
import { EventFilterType } from "../constants/event-filter";
import { EventRecord } from "../record/event";
import { UserRecord } from "../record/user";
import { ReduxStoreState } from "../store";
import { LinkButton } from "../widgets/link-button";

const _styles = stylesheet({
  mainPage: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: "10px",
  },

  communityEventWrapper: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  communityEventInfo: {
    display: "flex",
    alignItems: "center",
    $nest: {
      "& > *": {
        marginRight: "10px",
      },
    },
  },
  
  eventName: {
    color: "#0068da",
  },

  participantCount: {
    display: "flex",
    alignItems: "center",
    $nest: {
      "& > *": {
        marginRight: "3px",
      },
    },
  },

  count: {
    margin: "0px",
  },
});

interface HomeProps {
  events: EventRecord[];
  userId: string;
  allUsers: UserRecord[];
}

interface HomeState {
  eventFilterType: EventFilterType;
  filteredEvents : EventRecord[];
}

class HomePageComponent extends React.Component<HomeProps, HomeState> {
  constructor(props: HomeProps) {
    super(props);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.state = {
      eventFilterType: EventFilterType.upcomingEvent,
      filteredEvents: undefined,
    };
  }

  async handleSearch(query: string) {
    if (!query) {
      this.setState({
        filteredEvents: undefined,
      });
    } else {
      try {
        const searchEvents = await EventsApi.searchEvents(query);
        this.setState({
          filteredEvents: searchEvents,
        });
      } catch (e) {
        console.error(e);
      }
    }
  }

  handleFilterChange(filterType: EventFilterType): void {
    this.setState({
      eventFilterType: filterType,
    });
  }

  renderEvent(event: EventRecord, renderName: boolean = true) {
    const { allUsers } = this.props;
    const eventCreator = allUsers.find(u => u._id === event.creatorId);
    return (
      <div className={classes(_styles.communityEventWrapper, "list-group-item")}>
        <Link to={`/app/event/${event._id}`}>
          <p className={_styles.eventName}>{event.name}</p>
        </Link>
        {eventCreator && renderName &&
          <div className={_styles.communityEventInfo}>
            <p>{eventCreator.username}</p>
            <section className={_styles.participantCount}>
              <i className="fa fa-user" aria-hidden="true"></i>
              <p className={_styles.count}>{event.userGoing.length}</p>
            </section>
          </div>
        }
      </div>
    );
  }

  render(): JSX.Element {
    const { events, userId } = this.props;
    const { eventFilterType, filteredEvents } = this.state;
    const myEvents = events
      .filter((e: EventRecord) => e.creatorId === userId);
    let communityEvents = filteredEvents ||
      events.filter(e => !myEvents.find(evt => evt._id === e._id));
    switch (eventFilterType) {
      case EventFilterType.upcomingEvent:
        communityEvents = communityEvents
          .sort((e1, e2) => e1.date - e2.date);
        break;
      case EventFilterType.participants:
        communityEvents = communityEvents
          .sort((e1, e2) => e2.userGoing.length - e1.userGoing.length);
        break;
      default:
        break;
    }
    return (
      <div
          className={classes("col-sm-12", "col-md-12", "col-lg-12", "main-page", _styles.mainPage)}>
        {/* Render the community events */}
        <section>
          <h1>
            Community Events
          </h1>
          <section>
            <label htmlFor="eventSearchBar">Search: &nbsp;</label>
            <input
                id="eventSearchBar"
                type="text"
                placeholder="search for events"
                onChange={e => this.handleSearch(e.target.value)} />
          </section>
          <section>
            <label htmlFor="eventFilter">Sort By:&nbsp;</label>
            <select
                id="eventFilter"
                name="eventFilter"
                onChange={e =>
                  this.handleFilterChange(EventFilterType[e.target.value])
                }>
              <option value={EventFilterType.upcomingEvent}>Upcoming Event</option>
              <option value={EventFilterType.participants}>Participants</option>
            </select>
          </section>
          <div className="list-group">
            {communityEvents.map((e: EventRecord) => (
              <div key={e._id}>
                {this.renderEvent(e)}
              </div>
            ))}
          </div>
        </section>
        <section>
          <h1>
            My Events
          </h1>
          {myEvents.length <= 0
            ? <LinkButton
                  to="/app/event/new"
                  text="Create Event"
                  useAuth={true} />
            : <div className="list-group">
              {myEvents.map((e: EventRecord) => (
                <div key={e._id}>
                  {this.renderEvent(e, false)}
                </div>
              ))}
              </div>
          }
        </section>
        <section>
          <LinkButton
              to="/app/event/new"
              text="Create Event"
              useAuth={true} />
        </section>
      </div>
    );
  }
}

function mapStateToProps(
  state: ReduxStoreState,
  currentProps: Partial<HomeProps>,
) {
  return {
    ...currentProps,
    events: state.events.events,
    userId: state.user.user._id,
    allUsers: state.user.allUsers,
  };
}

function mapDispatchToProps(dispatch: any, currentProps: Partial<HomeProps>) {
  return {
    ...currentProps,
    dispatch: dispatch,
  };
}

export const HomePage = connect(
  mapStateToProps,
  mapDispatchToProps,
)(HomePageComponent);
