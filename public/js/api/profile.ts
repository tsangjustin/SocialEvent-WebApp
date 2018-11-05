import * as $ from "jquery";
import { UserRecord } from "../record/user";

export const ProfileApi = {
  getProfile(): Promise<UserRecord> {
    return new Promise((resolve, reject) => {
      $.ajax({
        method: "GET",
        url: "/profile",
        contentType: 'application/json',
        success: (data: any) => {
          if (!data || !data.hasOwnProperty("user")) {
            return resolve(<UserRecord>{});
          }
          return resolve(data.user);
        },
        error: (xhr, type, text) => {
          return reject(xhr.responseJSON);
        },
      });
    });
  },

  getAllUsers(): Promise<UserRecord[]> {
    return new Promise((resolve, reject) => {
      $.ajax({
        method: "GET",
        url: "/profile/all",
        success: (data: any) => {
          if (!data || !data.hasOwnProperty("users")) {
            return resolve([]);
          }
          return resolve(data.users);
        },
        error: (xhr, type, text) => {
          return reject(xhr.responseJSON);
        },
      });
    });
  },

  editProfile(user: any): Promise<UserRecord> {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: "PUT",
        url: "/profile",
        success: (data) => {
          // your callback here
          if (!data || !data.hasOwnProperty("user")) {
            return resolve(<UserRecord>{});
          }
          return resolve(data.user);
        },
        error: (xhr, type, text) => {
          // handle error
          return reject({
            ...xhr.responseJSON,
            status: xhr.status,
          });
        },
        data: JSON.stringify(user),
        cache: false,
        contentType: "application/json",
        processData: false,
      });
    });
  },
}
