import * as moments from "moment";
import * as React from "react";
import { connect } from "react-redux";
import { stylesheet } from "typestyle";

import { CommentsApi } from "../../api/comment";
import { EventRecord } from "../../record/event";
import { UserRecord } from "../../record/user";
import { ReduxStoreState } from "../../store";

const _styles = stylesheet({
  commentWrapper: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid gray",
    marginBottom: "3px",
    padding: "10px 10px",
    $nest: {
      "& > *": {
        marginRight: "5px",
      },
    },
  },

  editWrapper: {
    display: "flex",
    alignItems: "center",
    padding: "20px 10px",
  },

  content: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
  },

  metaWrapper: {
    display: "flex",
    $nest: {
      "& > *": {
        marginRight: "10px",
      },
    },
  },

  profilePic: {
    height: "50px",
    width: "50px",
    borderRadius: "50%",
  },

  editCommentWrapper: {
    width: "80%",
    height: "60px",
    resize: "none",
    marginRight: "10px",
  },
});

interface CommentProp {
  comment: any;
  currUserId: string;
  dispatch: any;
  event: EventRecord;
  user: UserRecord;
}

interface CommentState {
  isEditing: boolean;
  editComment: string;
}

class CommentComponent extends React.Component<CommentProp, CommentState> {
  constructor(props: CommentProp){ 
    super(props);
    this.deleteComment = this.deleteComment.bind(this);
    this.toggleEditMode = this.toggleEditMode.bind(this);
    this.handleCommentChange = this.handleCommentChange.bind(this);
    this.closeEditMode = this.closeEditMode.bind(this);
    this.handleSaveEdit = this.handleSaveEdit.bind(this);
    this.state = {
      isEditing: false,
      editComment: props.comment.comment,
    };
  }

  closeEditMode(): void {
    const { comment } = this.props;
    this.toggleEditMode(false);
    this.setState({
      editComment: comment.comment,
    });
  }

  async handleSaveEdit(): Promise<void> {
    const { comment, dispatch, event } = this.props;
    const { editComment } = this.state;
    try {
      await CommentsApi.editComment(event._id, comment._id, editComment);
      const comments = await CommentsApi.getCommentsForEvent(event._id);
      dispatch({
        type: "FETCH_ALL_COMMENTS",
        payload: {
          eventId: event._id,
          comments: comments,
        },
      });
      this.closeEditMode();
    } catch (e) {
      console.error(e);
    }
  }
  

  toggleEditMode(isEditing: boolean): void {
    this.setState({
      isEditing: isEditing,
    });
  }

  handleCommentChange(comment: string): void {
    this.setState({
      editComment: comment,
    });
  }

  async deleteComment() {
    const { comment, dispatch, event } = this.props;
    try {
      await CommentsApi.deleteComment(event._id, comment._id);
      const comments = await CommentsApi.getCommentsForEvent(event._id);
      dispatch({
        type: "FETCH_ALL_COMMENTS",
        payload: {
          eventId: event._id,
          comments: comments,
        },
      });
    } catch (e) {
      console.error(e);
    }
  }

  render(): JSX.Element {
    const { comment, currUserId, event, user } = this.props;
    const { editComment, isEditing } = this.state;
    if (!comment || !event) {
      return null;
    }
    const commendId = comment._id;
    const commentCreatorId = comment.userId;
    const text = comment.comment;
    const createTime = moments
      .unix(comment.createdAt)
      .format("MMMM DD, YYYY hh:mma");
    const commentUser = user || {
      _id: "-1",
      avatar: "/dist/image/avatar.png",
      username: "Anonymous",
    } as Partial<UserRecord>
    if (isEditing) {
      return (
        <div className={_styles.editWrapper}>
          <textarea
              className={_styles.editCommentWrapper}
              placeholder="Add comment"
              value={editComment}
              onChange={e => this.handleCommentChange(e.target.value)} />
          <button onClick={this.closeEditMode}>
            Cancel
          </button>
          <button
              disabled={!editComment}
              onClick={this.handleSaveEdit}>
            Save
          </button>
        </div>
      );
    }
    return (
      <div
          className={_styles.commentWrapper}
          key={`comment-${commendId}`}>
        <div>
          <img
              src={commentUser.avatar}
              className={_styles.profilePic}
              alt={`avatar-${commentUser._id}`} />
          <p>{commentUser.username}</p>
        </div>
        <div className={_styles.content}>
          <p>{text}</p>
          <section className={_styles.metaWrapper}>
            <p>{createTime}</p>
            {currUserId === commentCreatorId &&
              <i
                  className="fa fa-pencil"
                  aria-hidden="true"
                  onClick={() => this.toggleEditMode(true)} />
            }
            {currUserId === commentCreatorId &&
              <i
                  className="fa fa-trash"
                  aria-hidden="true"
                  onClick={this.deleteComment} />
            }
          </section>
        </div>
      </div>
    )
  }
}

function mapStateToProps(
  state: ReduxStoreState,
  currentProps: Partial<CommentProp>,
) {
  const userId = currentProps.comment.userId;
  return {
    ...currentProps,
    user: state.user.allUsers.find(u => u._id === userId),
    currUserId: state.user.user._id,
  };
}

function mapDispatchToProps(dispatch: any, currentProps: Partial<CommentProp>) {
  return {
    ...currentProps,
    dispatch: dispatch,
  };
}

export const Comment = connect(
  mapStateToProps,
  mapDispatchToProps,
)(CommentComponent);
