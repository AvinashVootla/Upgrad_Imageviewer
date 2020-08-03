import React, { Component } from "react";
import "./Profile.css";
import Header from "../../common/header/Header";
import profileImage from "../../assets/upgrad.svg";

import Typography from "@material-ui/core/Typography";
import Fab from "@material-ui/core/Fab";
import EditIcon from "@material-ui/icons/Edit";
import { withStyles } from "@material-ui/core";
import Modal from "react-modal";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import Button from "@material-ui/core/Button";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import CardHeader from "@material-ui/core/CardHeader";
import Avatar from "@material-ui/core/Avatar";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import FavoriteIcon from "@material-ui/icons/Favorite";
import IconButton from "@material-ui/core/IconButton";

const styles = (theme) => ({
  //Edit icon css
  editIcon: {
    marginLeft: "2%",
    width: "40px",
    height: "40px",
  },
  //Bold css
  boldFont: {
    "font-weight": 600,
  },
  fav: {
    padding: 0,
  },
  //Card Header Css
  cardHeader: {
    padding: "0 0 10px 10px",
  },
  //Comment css
  addComment: {
    display: "flex",
    flexDirection: "row",
    alignItems: "baseline",
  },
});

const TabContainer = function (props) {
  return (
    <Typography component="div" style={{ padding: 0, textAlign: "center" }}>
      {props.children}
    </Typography>
  );
};

const imageModalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    width: "60vw",
    height: "40vw",
  },
};

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

class Profile extends Component {
  constructor() {
    super();
    this.state = {
      isLogin: sessionStorage.getItem("access_token") === null ? false : true,
      access_token: sessionStorage.getItem("access_token"),
      user_id: sessionStorage.getItem("user_id"),
      nameUpdateModalIsOpen: false,
      modifiedFullName: "",
      modifiedFullNameRequired: "dispNone",
      images: [],
      selectedImage: {},
      imageModalIsOpen: false,
      comments: [],
      comment: "",
      commentCount: 1,
    };
  }

  randomNumberGenerator() {
    return Math.floor(Math.random() * 50) + 5;
  }

  randomLikeGenerator() {
    return Math.floor(Math.random() * 10) + 1;
  }

  componentDidMount() {
    let scope = this;
    if (this.state.isLogin) {
      //Request url for user details
      let userUrl =
        this.props.baseUrl +
        this.state.user_id +
        "?fields=media_count,username&access_token=" +
        this.state.access_token;
      //GET Request
      fetch(userUrl, {
        method: "GET",
      })
        .then((response) => {
          return response.json();
        })
        .then((jsonResponse) => {
          scope.setState({
            media_count: jsonResponse.media_count,
            username: jsonResponse.username,
            full_name: jsonResponse.username,
            followers: scope.randomNumberGenerator(),
            following: scope.randomNumberGenerator(),
          });
        })
        .catch((error) => {
          console.log("error user data", error);
        });
    }

    if (this.state.isLogin) {
      //Request url to get posts
      let url =
        this.props.baseUrl +
        "me/media?fields=caption,media_url,thumbnail_url,timestamp&access_token=" +
        this.state.access_token;
      //GET request
      fetch(url, {
        method: "GET",
      })
        .then((response) => {
          return response.json();
        })
        .then((jsonResponse) => {
          let imageData = jsonResponse.data;

          imageData.forEach((imageElement) => {
            let created_time = new Date(imageElement.timestamp)
              .toLocaleString()
              .split(",");
            imageElement.timestamp = created_time;
            let likes = scope.randomLikeGenerator();
            imageElement.likes = likes;
            imageElement.caption = imageElement.caption.split("\n");
            let isLiked = false;
            imageElement.isLiked = isLiked;
          });
          scope.setState({
            images: imageData,
          });
        })
        .catch((error) => {
          console.log("error user data", error);
        });
    }
  }

  //UserName edit handler
  userNameEditHandler = () => {
    this.setState({
      modifiedFullName: "",
      modifiedFullNameRequired: "dispNone",
      nameUpdateModalIsOpen: true,
    });
  };

  closeModalHandler = () => {
    this.setState({ nameUpdateModalIsOpen: false, imageModalIsOpen: false });
  };

  //Full Name Handler
  fullNameChangeHandler = (event) => {
    this.setState({ modifiedFullName: event.target.value });
  };

  //Update Full Name Handler
  updateFullNameClickHandler = () => {
    if (this.state.modifiedFullName === "") {
      this.setState({ modifiedFullNameRequired: "dispBlock" });
    } else {
      this.setState({
        full_name: this.state.modifiedFullName,
        nameUpdateModalIsOpen: false,
      });
    }
  };

  //Grid Image handler
  gridImageClickHandler = (image) => {
    this.setState({ selectedImage: image, imageModalIsOpen: true });
  };

  //Like Handler
  likeBtnHandler = (imageId) => {
    let imageData = this.state.images;
    for (let i = 0; i < imageData.length; i++) {
      if (imageData[i].id === imageId) {
        if (imageData[i].isLiked === true) {
          imageData[i].isLiked = false;
          imageData[i].likes--;
          this.setState({
            images: imageData,
          });
          break;
        } else {
          imageData[i].isLiked = true;
          imageData[i].likes++;
          this.setState({
            images: imageData,
          });
          break;
        }
      }
    }
  };

  //Comment change Handler
  commentTextChangeHandler = (event, imageId) => {
    let comment = {
      id: imageId,
      commentText: event.target.value,
    };
    this.setState({
      comment,
    });
  };
  //Add comment Handler
  addCommentHandler = () => {
    let count = this.state.commentCount;
    let comment = {
      id: count,
      imageId: this.state.comment.id,
      username: this.state.username,
      commentText: this.state.comment.commentText,
    };
    count++;
    let comments = [...this.state.comments, comment];
    this.setState({
      comments,
      commentCount: count,
      comment: "",
    });
  };
  render() {
    const { classes } = this.props;
    let selectedImage = this.state.selectedImage;

    return (
      <div>
        <Header showProfileIcon={this.state.isLogin ? true : false}></Header>
        <div className="profile-container">
          <div className="flex-container">
            <div className="profile-picture-section">
              <img
                src={profileImage}
                className="profile-picture"
                alt="profile"
              />
            </div>
            <div className="details-section">
              <Typography variant="h5" component="h5">
                {this.state.username}
              </Typography>
              <Typography component="p" className="stats-section">
                <span>Posts: {this.state.media_count}</span>
                <span>Follows: {this.state.following}</span>
                <span>Followed By: {this.state.followers}</span>
              </Typography>
              <Typography component="h6" variant="h6">
                {this.state.full_name}
                <Fab
                  color="secondary"
                  className={classes.editIcon}
                  onClick={this.userNameEditHandler}
                >
                  <EditIcon />
                </Fab>
              </Typography>
              <Modal
                ariaHideApp={false}
                isOpen={this.state.nameUpdateModalIsOpen}
                contentLabel="Edit"
                onRequestClose={this.closeModalHandler}
                style={customStyles}
              >
                <Typography variant="h5" component="h5">
                  Edit
                </Typography>
                <br />
                <TabContainer>
                  <FormControl required>
                    <InputLabel htmlFor="fullName">Full Name</InputLabel>
                    <Input
                      id="fullName"
                      type="text"
                      onChange={this.fullNameChangeHandler}
                    />
                    <FormHelperText
                      className={this.state.modifiedFullNameRequired}
                    >
                      <span className="red">required</span>
                    </FormHelperText>
                  </FormControl>
                  <br />
                  <br />
                </TabContainer>
                <br />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={this.updateFullNameClickHandler}
                >
                  Update
                </Button>
              </Modal>
            </div>
          </div>
          <div className="images-grid-list">
            <GridList cellHeight={300} cols={3} className="grid-list-main">
              {this.state.images.map((img) => (
                <GridListTile
                  key={img.id}
                  onClick={() => this.gridImageClickHandler(img)}
                >
                  <img src={img.media_url} alt={"image" + img.id} />
                </GridListTile>
              ))}
            </GridList>
            <Modal
              ariaHideApp={false}
              isOpen={this.state.imageModalIsOpen}
              contentLabel="view"
              onRequestClose={this.closeModalHandler}
              style={imageModalStyles}
            >
              {selectedImage.id && (
                <div>
                  <div className="image-section">
                    <img
                      src={selectedImage.media_url}
                      className="image-post"
                      alt={selectedImage.id}
                    ></img>
                  </div>
                  <div className="right-section">
                    <CardHeader
                      className={classes.cardHeader}
                      classes={{ title: classes.boldFont }}
                      avatar={<Avatar src={profileImage}></Avatar>}
                      title={this.state.username}
                    ></CardHeader>
                    <hr />
                    <div className="content">
                      <Typography className={classes.boldFont}>
                        {selectedImage.caption[0]}
                      </Typography>
                      <Typography className="image-hash-tag">
                        {selectedImage.caption[1]}
                      </Typography>
                    </div>
                    <div className="comments-section">
                      {this.state.comments.map((comment) =>
                        selectedImage.id === comment.imageId ? (
                          <div
                            className="comment-display"
                            key={"comment" + comment.id}
                          >
                            <Typography
                              className="comment-username"
                              style={{ fontWeight: "bold" }}
                            >
                              {comment.username}:
                            </Typography>
                            <Typography className="comment-text">
                              {comment.commentText}
                            </Typography>
                          </div>
                        ) : (
                          ""
                        )
                      )}
                    </div>
                    <div className="likes-add-comment-section">
                      <IconButton
                        className={classes.fav}
                        aria-label="like-button"
                        onClick={() => this.likeBtnHandler(selectedImage.id)}
                      >
                        {selectedImage.isLiked ? (
                          <FavoriteIcon
                            fontSize="large"
                            style={{ color: "red" }}
                          ></FavoriteIcon>
                        ) : (
                          <FavoriteBorderIcon fontSize="large"></FavoriteBorderIcon>
                        )}
                      </IconButton>
                      <Typography className="likes-count">
                        {selectedImage.likes === 1 ? (
                          <span>{selectedImage.likes} like</span>
                        ) : (
                          <span>{selectedImage.likes} likes</span>
                        )}
                      </Typography>
                      <div className="add-comments-section">
                        <FormControl className={classes.addComment}>
                          <InputLabel htmlFor="comments">
                            Add a comment
                          </InputLabel>
                          <Input
                            id={"comments" + selectedImage.id}
                            className="comments-input"
                            onChange={(event) =>
                              this.commentTextChangeHandler(
                                event,
                                selectedImage.id
                              )
                            }
                            value={selectedImage.commentText}
                          />
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={this.addCommentHandler.bind(this)}
                          >
                            ADD
                          </Button>
                        </FormControl>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Modal>
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(Profile);
