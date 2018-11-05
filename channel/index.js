const event = {
  Event: "Event",
  User: "User",
  Comment: "Comment",
  Profile: "Profile",
};

const action = {
  // Event Actions
  GetAllEvents: "GetAllEvents",
  GetEvent: "GetEvent",
  CreateEvent: "CreateEvent",
  UpdateEvent: "UpdateEvent",
  DeleteEvent: "DeleteEvent",
  SearchEvents: "SearchEvents",
  JoinEvent: "JoinEvent",
  LeaveEvent: "LeaveEvent",
  // User Actions
  GetUser: "GetUser",
  CreateUser: "CreateUser",
  UpdateUser: "UpdateUser",
  // Comment Actions
  GetAllComments: "GetAllComments",
  GetComment: "GetComment",
  AddComment: "AddComment",
  EditComment: "EditComment",
  DeleteComment: "DeleteComment",
  // Profile Actions
  GetAllProfile: "GetAllProfile",
  EditProfile: "EditProfile",
};

module.exports = {
  event: event,
  action: action,
};