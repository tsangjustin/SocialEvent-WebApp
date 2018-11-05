import { GoogleMap, Marker, withGoogleMap, withScriptjs } from "react-google-maps";
import * as moments from "moment";
import * as React from "react";
import { connect } from "react-redux";
import { Link, Redirect } from "react-router-dom";
import { stylesheet } from "typestyle";

import  { Comment } from "./widgets/comment";
import { CommentsApi } from "../api/comment";
import { EventsApi } from "../api/events";
import { EventRecord } from "../record/event";
import { LinkButton } from "../widgets/link-button";
import { ReduxStoreState } from "../store";

const _styles = {
  searchInput: {
    boxSizing: "border-box",
    border: `1px solid transparent`,
    width: `240px`,
    height: `32px`,
    marginTop: `27px`,
    padding: `0 12px`,
    borderRadius: `3px`,
    boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
    fontSize: `14px`,
    outline: `none`,
    textOverflow: `ellipses`,
  },

  count: {
    margin: "0px",
  },

  ...stylesheet({
    eventPageWrapper: {
      padding: "10px",
    },

    eventHeader: {
      display: "flex",
      alignItems: "center",
      $nest: {
        "& > *": {
          marginRight: "10px",
        },
      },
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

    buttonWrapper: {
      $nest: {
        "& > *": {
          marginRight: "10px",
        },
      },
    },

    commentWrapper: {
      height: "500px",
      width: "100%",
      overflowY: "scroll",
      backgroundColor: "white",
      marginBottom: "5px",
      border: "1px solid black",
    },

    textareaWrapper: {
      width: "80%",
      height: "60px",
      resize: "none",
      marginRight: "10px",
    },

    commentInputWrapper: {
      display: "flex",
      alignItems: "center",
      marginBottom: "10px",
    }
  }),
};

interface EventProps {
  match: any;
  dispatch: any;
  event: EventRecord;
  userId: string;
  googleMapURL: string;
  loadingElement: JSX.Element;
  containerElement: JSX.Element;
  mapElement: JSX.Element;
}

interface EventState {
  comment: string;
  loginRedirect: boolean;
}

class EventPageComponent extends React.Component<EventProps, EventState> {
  constructor(props: EventProps) {
    super(props);
    this.handleCommentChange = this.handleCommentChange.bind(this);
    this.handleComment = this.handleComment.bind(this);
    this.handleJoinEvent = this.handleJoinEvent.bind(this);
    this.handleLeaveEvent = this.handleLeaveEvent.bind(this);
    this.handleDeleteEvent = this.handleDeleteEvent.bind(this);
    this.state = {
      comment: "",
      loginRedirect: false,
    };
  }

  handleCommentChange(comment: string): void {
    this.setState({
      comment: comment,
    });
  }

  async handleComment(): Promise<void> {
    const { dispatch, event } = this.props
    const { comment } = this.state;
    try {
      await CommentsApi.commentForEvent(event._id, comment);
      const allComments = await CommentsApi.getCommentsForEvent(event._id);
      dispatch({
        type: "FETCH_ALL_COMMENTS",
        payload: {
          comments: allComments,
          eventId: event._id,
        },
      });
      this.setState({
        comment: "",
      });
    } catch (e) {
      console.error(e);
      alert(e.error);
    }
  }

  async handleJoinEvent(): Promise<void> {
    const { dispatch, event } = this.props
    try {
      const evt = await EventsApi.joinEvent(event._id);
      dispatch({
        type: "UPDATE_EVENT",
        payload: {
          event: evt,
        },
      });
    } catch (e) {
      console.error(e);
      this.setState({
        loginRedirect: e.status === 401,
      });
    }
  }

  async handleLeaveEvent(): Promise<void> {
    const { dispatch, event } = this.props
    try {
      const evt = await EventsApi.leaveEvent(event._id);
      dispatch({
        type: "UPDATE_EVENT",
        payload: {
          event: evt,
        },
      });
    } catch (e) {
      console.error(e);
      this.setState({
        loginRedirect: e.status === 401,
      });
    }
  }

  async handleDeleteEvent(): Promise<void> {
    const { dispatch, event } = this.props
    try {
      await EventsApi.deleteEvent(event._id);
      dispatch({
        type: "DELETE_EVENT",
        payload: {
          eventId: event._id,
        },
      });
    } catch (e) {
      console.error(e);
      this.setState({
        loginRedirect: e.status === 401,
      });
    }
  }

  render(): JSX.Element {
    const { event, userId } = this.props;
    const { comment, loginRedirect } = this.state;
    if (!event) {
      return (
        <Redirect to="/app" />
      );
    }
    if (loginRedirect) {
      return (
        <Redirect to="/app/login" />
      );
    }
    const eventDate = moments
      .unix(event.date)
      .format("MMMM DD, YYYY hh:mma");
    const eventLocation = {
      lat: event.location.latitude,
      lng: event.location.longitude,
    };
    const eventLocationName = event.locationName;
    const editRoute = userId
      ? `/app/event/${event._id}/edit`
      : "/app/login";
    const eventUserGoing: string[] = event.userGoing;
    const isUserGoing = eventUserGoing.includes(userId);
    return (
      <div className={_styles.eventPageWrapper}>
        <div>
          <GoogleMap
              key="AIzaSyAH5gFfEYSAdG02dhclzhKSTaRp_AmBEeI"
              defaultCenter={eventLocation}
              defaultZoom={15}>
            <Marker position={eventLocation} />
          </GoogleMap>
        </div>
        <div className={_styles.buttonWrapper}>
          {event.creatorId === userId &&
            <Link to={editRoute}>
              <button>
                Edit
              </button>
            </Link>
          }
          <button
              onClick={isUserGoing
                ? this.handleLeaveEvent
                : this.handleJoinEvent
              }>
            {isUserGoing ? "Not Going" : "Going"}
          </button>
          {event.creatorId === userId &&
            <button onClick={this.handleDeleteEvent}>
              Delete Event
            </button>
          }
        </div>
        <div className={_styles.eventHeader}>
          <h1>Event</h1>
          <section className={_styles.participantCount}>
            <i className="fa fa-user" aria-hidden="true"></i>
            <p style={_styles.count}>{event.userGoing.length}</p>
          </section>
        </div>
        <h2>Event Name</h2>
        <p>{event.name}</p>
        <h2>Event Description</h2>
        <p>{event.description}</p>
        <h2>Event Date</h2>
        <p>{String(eventDate)}</p>
        <h2>Event Location</h2>
        <p>{eventLocationName}</p>
        <div>
          <h2>Comments</h2>
          <div className={_styles.commentWrapper}>
            {event.comments.map(c =>
              <Comment
                  key={c._id}
                  comment={c}
                  event={event} />
            )}
          </div>
          <div className={_styles.commentInputWrapper}>
            <label htmlFor="comment-input" />
            <textarea
                className={_styles.textareaWrapper}
                id="comment-input"
                onChange={e => this.handleCommentChange(e.target.value)}
                value={comment} />
            {userId
              ? <button onClick={this.handleComment}>
                  Comment
                </button>
              : <LinkButton
                    to="/app/login"
                    text="Comment"
                    useAuth={true}
                    userId={userId} />
            }
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(
  state: ReduxStoreState,
  currentProps: Partial<EventProps>,
) {
  return {
    ...currentProps,
    event: currentProps.match.params.eventId
      ? state.events.events
        .find(e => currentProps.match.params.eventId === e._id)
      : {},
    userId: state.user.user._id,
    googleMapURL: "https://maps.googleapis.com/maps/api/js?key=<enter_key>&v=3.exp&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `400px`,  margin: "15px"}} />,
    mapElement: <div style={{ height: `100%`, margin: "15px" }} />,
  };
}

function mapDispatchToProps(dispatch: any, currentProps: Partial<EventProps>) {
  return {
    ...currentProps,
    dispatch: dispatch,
  };
}

export const EventPage = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withScriptjs(withGoogleMap(EventPageComponent)));