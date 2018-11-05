import * as $ from "jquery";

import { UserRecord } from "../record/user";

export const AuthApi = {
  login(username: string, password: string): Promise<UserRecord> {
    return new Promise((resolve, reject) => {
      $.ajax({
        method: "POST",
        url: "/log_in",
        contentType: 'application/json',
        data: JSON.stringify({
          username: username,
          password: password,
        }),
        dataType: 'json',
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

  signUp(
    username: string,
    password: string[],
    email: string,
    gender: string
  ): Promise<UserRecord> {
    return new Promise((resolve, reject) => {
      $.ajax({
        method: "POST",
        url: "/sign_up",
        contentType: 'application/json',
        data: JSON.stringify({
          username: username,
          password: password,
          email: email,
          gender: gender,
        }),
        dataType: 'json',
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

  logout(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      $.ajax({
        method: "GET",
        url: "/log_out",
        contentType: 'application/json',
        success: (data: any) => {
          if (!data || !data.hasOwnProperty("success")) {
            return resolve(false);
          }
          return resolve(data.success);
        },
        error: (xhr, type, text) => {
          return reject(text);
        },
      });
    });
  }
}
