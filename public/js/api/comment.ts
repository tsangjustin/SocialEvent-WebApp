import * as $ from "jquery";

import { CommentRecord } from "../record/comment";

export const CommentsApi = {
  getCommentsForEvent(eventId: string): Promise<CommentRecord[]> {
    return new Promise((resolve, reject) => {
      $.ajax({
        method: "GET",
        url: `/events/${eventId}/comment`,
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
  
  commentForEvent(eventId: string, comment: string): Promise<CommentRecord[]> {
    return new Promise((resolve, reject) => {
      $.ajax({
        method: "POST",
        url: `/events/${eventId}/comment`,
        contentType: "application/json",
        data: JSON.stringify({
          comment: comment,
        }),
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

  editComment(
    eventId: string,
    commentId: string,
    comment: string,
  ): Promise<CommentRecord> {
    return new Promise((resolve, reject) => {
      $.ajax({
        method: "PUT",
        url: `/events/${eventId}/comment/${commentId}`,
        contentType: "application/json",
        data: JSON.stringify({
          comment: comment,
        }),
        success: (data: any) => {
          if (!data || !data.hasOwnProperty("message")) {
            return resolve(<CommentRecord>{});
          }
          return resolve(data.message);
        },
        error: (xhr, type, text) => {
          return reject(xhr.responseJSON);
        },
      });
    });
  },

  deleteComment(eventId: string, commentId: string): Promise<CommentRecord> {
    return new Promise((resolve, reject) => {
      $.ajax({
        method: "DELETE",
        url: `/events/${eventId}/comment/${commentId}`,
        success: (data: any) => {
          if (!data || !data.hasOwnProperty("message")) {
            return resolve(<CommentRecord>{});
          }
          return resolve(data.message);
        },
        error: (xhr, type, text) => {
          return reject(xhr.responseJSON);
        },
      });
    });
  },
}
