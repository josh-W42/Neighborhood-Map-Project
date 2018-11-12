import React, { Component } from 'react';
import './App.css';
import Map from './Map.js';
import {GoogleApiWrapper} from 'google-maps-react';
import { apiKey } from './utils/GoogleApiHelpers.js';


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
          <div className="hamburger" onClick={this.onHamburgerClick}>
            <div className="bar1"></div>
            <div className="bar2"></div>
            <div className="bar3"></div>
          </div>
          <h1>Neighborhood Map</h1>
        </div>
        <Map google={this.props.google} />
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: apiKey
})(App)
