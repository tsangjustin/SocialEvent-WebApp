import * as React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { stylesheet, classes } from "typestyle";

import { ProfileApi } from "../api/profile";
import { UserRecord } from "../record/user";
import { ReduxStoreState } from "../store";

const _styles = stylesheet({
  profileWrapper: {
    padding: "10px",
  },

  buttonGroup: {
    marginBottom: "10px",
    $nest: {
      "& > *": {
        marginRight: "10px",
      },
    },
  },

  avatar: {
    width: "300px",
    height: "300px",
  },

  errorMsg: {
    color: "red",
  },

  profileFormWrapper: {
    width: "500px",
  },

  genderWrapper: {
    width: "fit-content",
  },
});

interface ProfileProp {
  dispatch: any;
  user: UserRecord;
  fetchAllUsers: () => void;
}

interface ProfileState {
  avatar: string;
  email: string;
  isEditing: boolean;
  gender: string;
  username: string;
  userError: string;
}

class ProfilePageComponent extends React.Component<ProfileProp, ProfileState> {
  constructor(props: ProfileProp) {
    super(props);
    this.handleCancelClick = this.handleCancelClick.bind(this);
    this.handleEditClick = this.handleEditClick.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handleGenderChange = this.handleGenderChange.bind(this);
    this.state = {
      avatar: props.user.avatar,
      email: props.user.email,
      isEditing: false,
      gender: props.user.isMale ? "male" : "female",
      username: props.user.username,
      userError: undefined,
    };
  }

  fileUpload: HTMLInputElement;

  getBase64(file): Promise<string> {
    return new Promise((success, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function () {
        return success(reader.result);
      };
      reader.onerror = function (error) {
        return success(undefined);
      };
    })
 }

  handleCancelClick(): void {
    const { user } = this.props;
    this.setState({
      avatar: user.avatar,
      email: user.email,
      isEditing: false,
      gender: user.isMale ? "male" : "female",
      username: user.username,
      userError: undefined,
    })
  }

  async handleEditClick(): Promise<void> {
    const { dispatch, fetchAllUsers } = this.props;
    const {
      avatar,
      email,
      isEditing,
      gender,
      username,
    } = this.state;
    if (isEditing) {
      const files = this.fileUpload.files;
      try {
        const img = files.length > 0 ? await this.getBase64(files[0]) : avatar;
        const editUser = {
          avatar: img,
          email: email,
          gender: gender.toLowerCase(),
          username: username,
        };
        const updatedUser = await ProfileApi.editProfile(editUser);
        this.setState({
          isEditing: false,
          userError: undefined,
          avatar: updatedUser.avatar,
          email: updatedUser.email,
          gender: updatedUser.isMale ? "male" : "female",
          username: updatedUser.username,
        });
        dispatch({
          type: "SAVE_USER",
          payload: {
            user: updatedUser,
          },
        });
        fetchAllUsers();
      } catch (e) {
        console.error(e);
        // Payload size too large
        if (e.status == 413) {
          this.setState({
            userError: "File size too large",
          });
        } else {
          this.setState({
            userError: e.error,
          });
        }
      }
    } else {
      this.setState({
        isEditing: true,
      });
    }
  }

  handleNameChange(username: string): void {
    this.setState({
      username: username,
    });
  }

  handleEmailChange(email: string): void {
    this.setState({
      email: email,
    });
  }

  handleGenderChange(gender: string): void {
    this.setState({
      gender: gender,
    });
  }

  renderEditProfile(): JSX.Element {
    const { avatar, email, gender, username } = this.state;
    return (
      <div className={_styles.profileFormWrapper}>
        <section>
          <label htmlFor="name">Name: &nbsp;</label>
          <span>{username}</span>
        </section>
        <div className="form-group row">
          <label htmlFor="email">Email</label>
          <input
              className="form-control"
              id="email"
              onChange={e => this.handleEmailChange(e.target.value)}
              type="text"
              value={email} />
        </div>
        <div className="form-group row">
          <label htmlFor="gender">Gender</label>
          <select
              className={classes("form-control", _styles.genderWrapper)}
              id="gender"
              name="gender"
              onChange={e => this.handleGenderChange(e.target.value)}
              value={gender}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <section>
          <img
              alt="user-avatar"
              className={_styles.avatar}
              src={avatar as string} />
          <br />
          <div className="form-group row">
            <label htmlFor="editAvatar">File size must be &lt; 10MB &nbsp;</label>
            <input
                aria-hidden="true"
                className="fa fa-file form-control-file"
                id="editAvatar"
                ref={el => this.fileUpload = el}
                type="file" />
          </div>
        </section>
      </div>
    );
  }

  renderProfile(): JSX.Element {
    const { user } = this.props;
    const username = user.username;
    const avatar = user.avatar;
    const email = user.email;
    const gender = user.isMale ? "Male" : "Female";
    return (
      <div>
        <section>
          <h2>Name:</h2>
          <p>{username}</p>
        </section>
        <section>
          <h2>Email:</h2>
          <p>{email}</p>
        </section>
        <section>
          <h2>Gender:</h2>
          <p>{gender}</p>
        </section>
        <section>
          <h2>Avatar:</h2>
          <img
              alt="user-avatar"
              className={_styles.avatar}
              src={avatar} />
        </section>
      </div>
    );
  }

  render(): JSX.Element {
    const { user } = this.props;
    const { isEditing, userError } = this.state;
    if (!user._id) {
      return (
        <Redirect to="/app" />
      );
    }
    return (
      <div className={_styles.profileWrapper}>
        <header>
          <h1>Profile</h1>
        </header>
        <div className={_styles.buttonGroup}>
          <button onClick={this.handleEditClick}>
            {isEditing ? "Save" : "Edit"}
          </button>
          {isEditing &&
            <button onClick={this.handleCancelClick}>
              Cancel
            </button>
          }
        </div>
        {isEditing
          ? this.renderEditProfile()
          : this.renderProfile()
        }
        <p className={_styles.errorMsg}>{userError}</p>
      </div>
    );
  }
}

function mapStateToProps(
  state: ReduxStoreState,
  currentProps: Partial<ProfileProp>,
) {
  return {
    ...currentProps,
    user: state.user.user,
  };
}

function mapDispatchToProps(dispatch: any, currentProps: Partial<ProfileProp>) {
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
  };
}

export const ProfilePage = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProfilePageComponent);
