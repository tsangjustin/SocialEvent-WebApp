import * as React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { classes, stylesheet } from "typestyle";

import { AuthApi } from "../api/auth";
import { UserRecord } from "../record/user";
import { ReduxStoreState } from "../store";

const _styles = stylesheet({
  navHeader: {
    height: "48px",
    backgroundColor: "#767676",
  },

  homeButton: {
    color: "#ffffff",
    backgroundColor: "#767676",
  },

  navWrapper: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  authButtons: {
    display: "flex",
    justifyContent: "flex-end",
    height: "100%",
    width: "100%",
  },

  authText: {
    lineHeight: "21px",
    $nest: {
      "&:not(:last-child)": {
        marginRight: "16px",
      },
    },
  },

  profilePic: {
    height: "100%",
    borderRadius: "50%",
  },
});

interface NavBarProps {
  dispatch: any;
  user: UserRecord;
}

class NavBarComponent extends React.Component<NavBarProps, undefined> {
  constructor(props: NavBarProps) {
    super(props);
    this.handleLogout = this.handleLogout.bind(this);
  }

  async handleLogout() {
    const { dispatch } = this.props;
    try {
      const logout = await AuthApi.logout();
      if (logout) {
        dispatch({
          type: "LOGOUT_USER",
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  renderAuth() {
    const { user } = this.props;
    if (user._id) {
      return (
        <div className={_styles.authButtons}>
					<Link to="/app/profile">
            <img
                src={user.avatar}
                className={classes(_styles.authText, _styles.profilePic)}
                alt="Event creator" />
          </Link>
          <p
              className={_styles.authText}
              onClick={this.handleLogout}>
            Logout
          </p>
        </div>
      );
    } else {
      return (
        <div className={_styles.authButtons}>
          <Link
              className={_styles.authText}
              to="/app/login">
            Login
          </Link>
          <Link
              className={_styles.authText}
              to="/app/sign_up">
            Sign Up
          </Link>
        </div>
      );
    }
  }

  render(): JSX.Element {
    return (
      <header className={_styles.navHeader}>
        <div className="row">
          <div className="col-sm-12 col-md-12 col-lg-12 sidebar">
            <div className={classes("home", _styles.navWrapper)}>
              <Link to="/app">
                <i className="fa fa-home" aria-hidden="true"></i>
                <p className={_styles.homeButton}>Home</p>
              </Link>
            </div>
            {this.renderAuth()}
          </div>
        </div>
      </header>
    );
  }
}

function mapStateToProps(
  state: ReduxStoreState,
  currentProps: Partial<NavBarProps>,
) {
  return {
    ...currentProps,
    user: state.user.user,
  };
}

function mapDispatchToProps(dispatch: any, currentProps: Partial<NavBarProps>) {
  return {
    ...currentProps,
    dispatch: dispatch,
  };
}

export const NavBar = connect(
  mapStateToProps,
  mapDispatchToProps,
)(NavBarComponent);
