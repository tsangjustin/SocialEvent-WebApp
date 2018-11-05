import * as React from "react";
import { Link, Redirect } from "react-router-dom";
import { connect } from "react-redux";

import { ReduxStoreState } from "../store";

interface LinkProp {
  to: string;
  text: string;
  useAuth: boolean
  userId: string;
}

class LinkButtonComponent extends React.Component<LinkProp, undefined> {
  render(): JSX.Element {
    const { text, to, useAuth, userId } = this.props;
    const clickRoute = useAuth && !userId
      ? "/app/login"
      : to
    return (
      <Link to={clickRoute}>
        <button>
          {text}
        </button>
      </Link>
    );
  }
}

function mapStateToProps(
  state: ReduxStoreState,
  currentProps: Partial<LinkProp>,
) {
  return {
    ...currentProps,
    userId: state.user.user._id,
  };
}

export const LinkButton = connect(
  mapStateToProps,
  undefined,
)(LinkButtonComponent);
