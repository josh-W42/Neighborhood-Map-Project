import React, { Component } from 'react';
import './App.css';
import Map from './Map.js';
import {GoogleApiWrapper} from 'google-maps-react';
import { register } from './serviceWorker.js';

//Code to use envrirnment variables
require('dotenv').config()
// Registering service worker
register();

// These two functions to handle user tabbing cases.
// If the user is using tabs to use the app then focus is present.
// If the user is not using tabs, then
function handleFirstTab(e) {
  if (e.keyCode === 9) {
    document.body.classList.add('user-is-tabbing');

    window.removeEventListener('keydown', handleFirstTab);
    window.addEventListener('mousedown', handleMouseDownOnce);
  }
}

function handleMouseDownOnce() {
  document.body.classList.remove('user-is-tabbing');

  window.removeEventListener('mousedown', handleMouseDownOnce);
  window.addEventListener('keydown', handleFirstTab);
}

window.addEventListener('keydown', handleFirstTab);

export class App extends Component {

  // This function handles sideUI functionality.
  onHamburgerClick() {
    let hamburger = document.querySelector('.hamburger');
    let sideUI = document.querySelector('#sideUI');
    if(hamburger.classList.contains('cross')) {
      sideUI.style.left = '-50%';
      hamburger.style.left = '0%';
    } else {
      sideUI.style.left = '0px';
      hamburger.style.left = '50%';
    }
    hamburger.classList.toggle('cross');
  }

  render() {
    return (
      <div className="App">
        <div className="topSection">
          <div role="button" aria-label="Menu Toggle" tabIndex="0" className="hamburger cross" onClick={this.onHamburgerClick}>
            <div className="bar1"></div>
            <div className="bar2"></div>
            <div className="bar3"></div>
          </div>
          <h1  tabIndex="0">Neighborhood Map</h1>
        </div>
        <Map
          google={this.props.google} />
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY
})(App)
