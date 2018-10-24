import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
// import GoogleMap from './Map.js'

class App extends Component {
  render() {
    return (
      <div className="App">
        <div>

        </div>
        <script async defer src="https://maps.googleapis.com/maps/api/js?libraries=geometry,drawing&key=AIzaSyDXbgkEoSEdXPyG7GDmuf7Mb1wW8RZ1Ek4&v=3&callback=initMap">
        </script>
      </div>
    );
  }
}

export default App;
