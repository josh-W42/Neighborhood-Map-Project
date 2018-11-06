import React, { Component } from 'react';
import './App.css';
import Map from './Map.js';
import {GoogleApiWrapper} from 'google-maps-react';


export class App extends Component {
  render() {
    return (
      <div className="App">
        <Map google={this.props.google} />
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyDXbgkEoSEdXPyG7GDmuf7Mb1wW8RZ1Ek4'
  // libraries: ['places', 'geometry']
})(App)
