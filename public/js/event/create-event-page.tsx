import { GoogleMap, Marker, withGoogleMap, withScriptjs } from "react-google-maps";
import SearchBox from "react-google-maps/lib/components/places/SearchBox"
import moment, * as moments from "moment";
import * as React from "react";
import { SingleDatePicker } from 'react-dates';
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { classes, stylesheet } from "typestyle";

import { EventsApi } from "../api/events";
import { EventRecord } from "../record/event";
import { ReduxStoreState } from "../store";

const _styles = {
  ...{
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
  },

  ...stylesheet({
    datetime: {
      width: "fit-content",
      $nest: {
        "&:not(:last-child)": {
          marginRight: "6px",
        },
      },
    },

    buttonWrapper: {
      marginBottom: "15px",
      $nest: {
        "& > *": {
          marginRight: "10px",
        },
      },
    },

    eventFormWrapper: {
      width: "700px",
    },
  }),
};

interface EventProps {
  dispatch: any;
  event?: EventRecord;
  match: any;
  userId: string;
  googleMapURL: string;
  loadingElement: JSX.Element;
  containerElement: JSX.Element;
  mapElement: JSX.Element;
}

interface EventState {
  cancelCreate: boolean;
  name: string;
  date: moments.Moment;
  description: string;
  error: string;
  eventRedirect: string;
  focused: boolean;
  location: object;
  locationName: string;
  time: string;
}

class CreateEventPageComponent extends React.Component<EventProps, EventState> {
  static defaultProps: Partial<EventProps> = {
    event: undefined,
  }

  constructor(props: EventProps) {
    super(props);
    const loc = (props.event && props.event.location)
      ? {
          lat: props.event.location.latitude,
          lng: props.event.location.longitude,
        }
      : {
          lat: 40.745635,
          lng: -74.0293937,
        };
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleDescChange = this.handleDescChange.bind(this);
    this.handleTimeChange = this.handleTimeChange.bind(this);
    this.handlePlaceChanged = this.handlePlaceChanged.bind(this);
    this.handleSaveEvent = this.handleSaveEvent.bind(this);
    this.handleCancelEvent = this.handleCancelEvent.bind(this);
    this.state = {
      cancelCreate: false,
      name: props.event ? props.event.name : "",
      date: (props.event && props.event.date)
        ? moments.unix(props.event.date)
        : moment(),
      description: props.event ? props.event.description : "",
      error: undefined,
      eventRedirect: undefined,
      focused: false,
      location: loc,
      locationName: props.event
        ? props.event.locationName
        : "1 Castle Point Terrace, Hoboken, NJ 07030",
      time: (props.event && props.event.date)
        ? moment.unix(props.event.date).format("HH:mm")
        : "",
    };
  }

  searchBox: SearchBox;

  handleNameChange(name: string): void {
    this.setState({
      name: name,
    });
  }

  handleDescChange(description: string): void {
    this.setState({
      description: description,
    });
  }

  handleDateChange(date: moments.Moment): void {
    this.setState({
      date: date,
    });
  }

  handleTimeChange(time: string): void {
    this.setState({
      time: time,
    });
  }

  handleLocationChange(location: object): void {
    this.setState({
      location: location,
    });
  }

  handleCancelEvent(): void {
    this.setState({
      cancelCreate: true,
    });
  }

  async handleMapClick(e): Promise<void> {
    const eventLocation = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
    };
    const geocoder = new google.maps.Geocoder;
    geocoder.geocode(
      {"location": eventLocation},
      (results, status) => {
        if (results.length > 0) {
          this.setState({
            locationName: results[0].formatted_address,
          });
        }
      },
    );
    this.handleLocationChange(eventLocation);
  }

  handlePlaceChanged() {
    const places = this.searchBox.getPlaces()[0];
    const location = places.geometry.location;
    const eventLocation = {
      lat: location.lat(),
      lng: location.lng(),
    };
    const geocoder = new google.maps.Geocoder;
    geocoder.geocode(
      {"location": eventLocation},
      (results, status) => {
        if (results.length > 0) {
          this.setState({
            locationName: results[0].formatted_address,
          });
        }
      },
    );
    this.handleLocationChange(eventLocation);
  }

  async handleSaveEvent() {
    const { dispatch, event } = this.props;
    const {
      name,
      date,
      description,
      location,
      locationName,
      time,
    } = this.state;
    const timeSplit = time.split(":");
    const eventDate = date
      .hour(Number(timeSplit[0]))
      .minute(Number(timeSplit[1]));
    const eventData = {
      name: name,
      description: description,
      eventAt: eventDate.unix(),
      location: {
        latitude: (location as any).lat,
        longitude: (location as any).lng,
      },
      locationName: locationName,
    };
    // Updating event
    if (event && event._id) {
      try {
        const updatedEvent = await EventsApi.updateEvent(event._id, eventData);
        dispatch({
          type: "UPDATE_EVENT",
          payload: {
            event: updatedEvent,
          },
        });
        this.setState({
          eventRedirect: updatedEvent._id,
        });
      } catch (e) {
        console.error(e);
        this.setState({
          error: e.error,
        });
      }
    // Creating event
    } else {
      try {
        const createdEvent = await EventsApi.createEvent(eventData);
        dispatch({
          type: "CREATE_EVENT",
          payload: {
            event: createdEvent,
          },
        });
        this.setState({
          eventRedirect: createdEvent._id,
        });
      } catch (e) {
        console.error(e);
        this.setState({
          error: e.error,
        })
      }
    }
  }

  render(): JSX.Element {
    const { event, userId } = this.props;
    const { cancelCreate, error, eventRedirect } = this.state;
    const {
      date,
      description,
      location,
      name,
      time,
    } = this.state;
    if (!userId || (cancelCreate && !event) || (event && userId !== event.creatorId)) {
      return (
        <Redirect to="/app" />
      );
    }
    if (cancelCreate && event) {
      return (
        <Redirect to={`/app/event/${event._id}`} />
      );
    }
    if (eventRedirect) {
      return (
        <Redirect to={`/app/event/${eventRedirect}`} />
      );
    }
    return (
      <div>
        <div>
          <GoogleMap
              key="AIzaSyAH5gFfEYSAdG02dhclzhKSTaRp_AmBEeI"
              center={location}
              defaultZoom={15}
              onClick={e => this.handleMapClick(e)}>
            <SearchBox
                controlPosition={google.maps.ControlPosition.TOP_LEFT}
                key="AIzaSyAH5gFfEYSAdG02dhclzhKSTaRp_AmBEeI"
                onPlacesChanged={this.handlePlaceChanged}
                ref={(el) => this.searchBox = el}>
              <input
                  id="map-placeholder"
                  type="text"
                  placeholder="Customized your placeholder"
                  style={_styles.searchInput} />
            </SearchBox>
            <Marker position={location} />
          </GoogleMap>
        </div>
        <h1>Event</h1>
        <div className={_styles.eventFormWrapper}>
          <div>
            <div className="form-group">
              <label htmlFor="eventName">Event Name</label>
              <input
                  className="form-control"
                  id="eventName"
                  type="text"
                  value={name}
                  onChange={e => this.handleNameChange(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="eventDescription">Event Description</label>
              <textarea
                  className="form-control"
                  id="eventDescription"
                  value={description}
                  onChange={e => this.handleDescChange(e.target.value)} />
            </div>
            <div>
              <div className="form-group">
                <label htmlFor="eventDate">Event Date</label>
                <br />
                <SingleDatePicker
                    className="form-control"
                    focused={this.state.focused}
                    id="eventDate"
                    date={date}
                    onDateChange={date => this.handleDateChange(date)}
                    onFocusChange={
                      ({focused}) => this.setState({focused: focused})
                    } />
              </div>
              <div className="form-group">
                <label htmlFor="event-time">Event At</label>
                <input
                    className={classes("form-control", _styles.datetime)}
                    id="event-time"
                    type="time"
                    value={time}
                    onChange={e => this.handleTimeChange(e.target.value)} />
              </div>
            </div>
          </div>
        </div>
        <div className={_styles.buttonWrapper}>
          <button onClick={this.handleSaveEvent}>
            {`${(event && event._id) ? "Update ": "Create "} Event`}
          </button>
          <button onClick={this.handleCancelEvent}>
            Cancel
          </button>
        </div>
        <p>{error}</p>
      </div>
    );
  }
}

function mapStateToProps(
  state: ReduxStoreState,
  currentProps: Partial<EventProps>
) {
  const eventId = currentProps.match.params.eventId
  return {
    ...currentProps,
    userId: state.user.user._id,
    event: eventId
      ? state.events.events.find((e: any) => e._id === eventId)
      : undefined,
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

export const CreateEventPage = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withScriptjs(withGoogleMap(CreateEventPageComponent)));