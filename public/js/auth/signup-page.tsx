import * as React from "react";
import  { Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { classes, stylesheet } from "typestyle";

import { AuthApi } from "../api/auth";
import { ProfileApi } from "../api/profile";
import { ReduxStoreState } from "../store";

const _styles = stylesheet({
  signUpPage: {
    padding: "10px",
  },
  
  signUpForm: {
    width: "500px",
  },

  genderWrapper: {
    width: "fit-content",
  },
});

interface SignUpProps {
  dispatch: any;
  fetchAllUsers: () => void;
  userId: string;
}

interface SignUpState {
  username: string;
  password: string[];
  email: string;
  gender: string;
  error: string;
}

class SignUpPageComponent extends React.PureComponent<SignUpProps, SignUpState> {
  constructor(props) {
    super(props);
    this.handleSignUp = this.handleSignUp.bind(this);
    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handleGenderChange = this.handleGenderChange.bind(this);
    this.state = {
      username: "",
      password: ["", ""],
      email: "",
      gender: "male",
      error: undefined,
    };
  }

  async handleSignUp(): Promise<void> {
    const { dispatch, fetchAllUsers } = this.props;
    const { email, gender, username, password } = this.state;
    try {
      const user = await AuthApi.signUp(
        username,
        password,
        email,
        gender,
      );
      dispatch({
        type: "LOGIN_USER",
        payload: {
          user: user,
        },
      });
      fetchAllUsers();
    } catch (e) {
      console.error(e);
      // TODO: set error in state
      this.setState({
        error: e.error,
      });
    }
  }

  handleUsernameChange(username: string) {
    this.setState({
      username: username,
    });
  }

  handlePasswordChange(passwordIdx: number, password: string) {
    const newPassword = [...this.state.password];
    newPassword[passwordIdx] = password;
    this.setState({
      password: newPassword,
    });
  }

  handleEmailChange(email: string) {
    this.setState({
      email: email,
    });
  }

  handleGenderChange(gender: string) {
    this.setState({
      gender: gender,
    });
  }

  render(): JSX.Element {
    const { userId } = this.props;
    const { email, error, gender, password, username } = this.state;
    if (userId) {
      return (
        <Redirect to="/app" />
      );
    }
    return (
      <div className={_styles.signUpPage}>
        <p>Sign Up</p>
        <div className={_styles.signUpForm}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
                className="form-control"
                id="username"
                type="text"
                onChange={e => this.handleUsernameChange(e.target.value)}
                value={username} />
          </div>
          <div className="form-group">
            <label htmlFor="password-1">Password</label>
            <input
                className="form-control"
                id="password-1"
                type="password"
                onChange={e => this.handlePasswordChange(0, e.target.value)}
                value={password[0]}/>
          </div>
          <div className="form-group">
            <label htmlFor="password-2">Confirm Password</label>
            <input
                className="form-control"
                id="password-2"
                type="password"
                onChange={e => this.handlePasswordChange(1, e.target.value)}
                value={password[1]} />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
                className="form-control"
                id="email"
                type="email"
                value={email}
                onChange={e => this.handleEmailChange(e.target.value)} />
          </div>
          <div className="form-group">
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
          <button onClick={this.handleSignUp}>
            Sign Up
          </button>
          <p>{error}</p>
        </div>
      </div>
    );
  }
}

function mapStateToProps(
  state: ReduxStoreState,
  currentProps: Partial<SignUpProps>,
) {
  return {
    ...currentProps,
    userId: state.user.user._id,
  };
}

function mapDispatchToProps(dispatch: any, currentProps: Partial<SignUpProps>) {
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

export const SignUpPage = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SignUpPageComponent);
