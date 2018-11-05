import * as $ from "jquery";

import { EventRecord } from "../record/event";

export const EventsApi = {
  getAllEvents(): Promise<EventRecord[]> {
    return new Promise((resolve, reject) => {
      $.ajax({
        method: "GET",
        url: "/events",
        success: (data: any) => {
          if (!data || !data.hasOwnProperty("message")) {
            return resolve([]);
          }
          return resolve(data.message);
        },
        error: (xhr, type, text) => {
          return reject(xhr.responseJSON);
        },
      });
    });
  },

  getEventById(eventId: string): Promise<EventRecord> {
    return new Promise((resolve, reject) => {
      $.ajax({
        method: "GET",
        url: `/events/${eventId}`,
        success: (data: any) => {
          if (!data || !data.hasOwnProperty("message")) {
            return resolve(<EventRecord>{});
          }
          return resolve(data.message);
        },
        error: (xhr, type, text) => {
          return reject(xhr.responseJSON);
        },
      })
    });
  },

  createEvent(event: object): Promise<EventRecord> {
    return new Promise((resolve, reject) => {
      $.ajax({
        method: "POST",
        url: "/events",
        contentType: "application/json",
        data: JSON.stringify(event),
        success: (data: any) => {
          if (!data || !data.hasOwnProperty("message")) {
            return resolve(<EventRecord>{});
          }
          return resolve(data.message);
        },
        error: (xhr, type, text) => {
          return reject({
            ...xhr.responseJSON,
            status: xhr.status,
          });
        },
      });
    })
  },

  updateEvent(eventId: string, event: object): Promise<EventRecord> {
    return new Promise((resolve, reject) => {
      $.ajax({
        method: "PUT",
        url: `/events/${eventId}`,
        contentType: "application/json",
        data: JSON.stringify(event),
        success: (data: any) => {
          if (!data || !data.hasOwnProperty("message")) {
            return resolve(<EventRecord>{});
          }
          return resolve(data.message);
        },
        error: (xhr, type, text) => {
          return reject({
            ...xhr.responseJSON,
            status: xhr.status,
          });
        },
      });
    })
  },

  deleteEvent(eventId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      $.ajax({
        method: "DELETE",
        url: `/events/${eventId}`,
        success: (data: any) => {
          if (!data || !data.hasOwnProperty("message")) {
            return resolve(undefined);
          }
          return resolve(data.message);
        },
        error: (xhr, type, text) => {
          return reject({
            ...xhr.responseJSON,
            status: xhr.status,
          });
        },
      });
    })
  },

  joinEvent(eventId: string): Promise<EventRecord> {
    return new Promise((resolve, reject) => {
      $.ajax({
        method: "PUT",
        url: `/events/${eventId}/join`,
        success: (data: any) => {
          if (!data || !data.hasOwnProperty("message")) {
            return resolve(<EventRecord>{});
          }
          return resolve(data.message);
        },
        error: (xhr, type, text) => {
          return reject({
            ...xhr.responseJSON,
            status: xhr.status,
          });
        },
      });
    })
  },

  leaveEvent(eventId: string): Promise<EventRecord> {
    return new Promise((resolve, reject) => {
      $.ajax({
        method: "PUT",
        url: `/events/${eventId}/leave`,
        success: (data: any) => {
          if (!data || !data.hasOwnProperty("message")) {
            return resolve(<EventRecord>{});
          }
          return resolve(data.message);
        },
        error: (xhr, type, text) => {
          return reject({
            ...xhr.responseJSON,
            status: xhr.status,
          });
        },
      });
    });
  },

  searchEvents(query: string): Promise<EventRecord[]> {
    return new Promise((resolve, reject) => {
      $.ajax({
        method: "GET",
        url: "/events/search",
        data: {
          q: query,
        },
        success: (data: any) => {
          if (!data || !data.hasOwnProperty("message")) {
            return resolve([]);
          }
          return resolve(data.message);
        },
        error: (xhr, type, text) => {
          return reject(xhr.responseJSON);
        },
      });
    });
  }
}
