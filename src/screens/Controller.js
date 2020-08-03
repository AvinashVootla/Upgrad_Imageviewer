import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import Login from "./login/Login";
import Home from "./home/Home";
import Profile from "./profile/Profile";

class Controller extends Component {
  constructor() {
    super();
    this.baseUrl = "https://graph.instagram.com/";
  }

  render() {
    return (
      <Router>
        {/* Route to login screen */}
        <Route exact path="/" render={(props) => <Login {...props} />} />
        {/* Route to home screen */}
        <Route
          exact
          path="/home"
          render={(props) => <Home {...props} baseUrl={this.baseUrl} />}
        />
        {/* Route to profile screen */}
        <Route
          exact
          path="/profile"
          render={(props) => (
            <Profile {...props} baseUrl={this.baseUrl}></Profile>
          )}
        ></Route>
      </Router>
    );
  }
}

export default Controller;
