import * as React from "react";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { stylesheet } from "typestyle";

import { AuthApi } from "../api/auth";
import { ReduxStoreState } from "../store";

const _styles = stylesheet({
  loginPageWrapper: {
    padding: "10px",
  },

  loginForm: {
    width: "500px",
  },
});

interface LoginProp {
  userId: string;
  dispatch: any;
}

interface LoginState {
  username: string;
  password: string;
  error: string;
}

class LoginPageComponent extends React.Component<LoginProp, LoginState> {
  constructor(props: LoginProp) {
    super(props);
    this.handleLogin = this.handleLogin.bind(this);
    this.state = {
      username: "",
      password: "",
      error: "",
    };
  }

  handleNameChange(username: string): void {
    this.setState({
      username: username,
    });
  }

  handlePasswordChange(password: string): void {
    this.setState({
      password: password,
    });
  }

  async handleLogin(): Promise<void> {
    const { dispatch } = this.props;
    const { username, password } = this.state;
    try {
      const user = await AuthApi.login(username, password);
      dispatch({
        type: "LOGIN_USER",
        payload: {
          user: user,
        },
      });
    } catch (e) {
      console.error(e);
      this.setState({
        error: e.error,
      });
    }
  }

  render(): JSX.Element {
    const { userId } = this.props;
    const { error } = this.state;
    if (userId) {
      return (
        <Redirect to="/app" />
      );
    }
    return (
      <div className={_styles.loginPageWrapper}>
        <p>Login</p>
        <div className={_styles.loginForm}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
                className="form-control"
                id="username"
                type="text"
                onChange={
                  (evt) => this.handleNameChange(evt.target.value)
                } />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
                className="form-control"
                id="password"
                type="password"
                onChange={
                  (evt) => this.handlePasswordChange(evt.target.value)
                }/>
          </div>
          <button onClick={this.handleLogin}>
            Login
          </button>
          <p>{error}</p>
        </div>
      </div>
    );
  }
}

function mapStateToProps(
  state: ReduxStoreState,
  currentProps: Partial<LoginProp>,
) {
  return {
    ...currentProps,
    userId: state.user.user._id,
  };
}

function mapDispatchToProps(dispatch: any, currentProps: Partial<LoginProp>) {
  return {
    ...currentProps,
    dispatch: dispatch,
  };
}

export const LoginPage = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LoginPageComponent);
