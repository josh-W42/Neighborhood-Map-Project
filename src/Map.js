import React, { Component } from 'react';
import {Map, InfoWindow, Marker, GoogleApiWrapper} from 'google-maps-react';

export class MapContainer extends Component {


  onMarkerClick () {
  }

  render() {
    return (
      <Map
        google={this.props.google}
        zoom={14}
        initialCenter={{
            lat: 34.069064,
            lng: -118.445050
          }}
        >

        <Marker onClick={console.log(this.onMarkerClick)}
                animation={this.props.google.maps.Animation.DROP}
                name={'Current location'} />

        <InfoWindow onClose={this.onInfoWindowClose}>
            <div>
              <h1>Hello</h1>
            </div>
        </InfoWindow>
      </Map>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyDXbgkEoSEdXPyG7GDmuf7Mb1wW8RZ1Ek4'
  // libraries: ['places', 'geometry']
})(MapContainer)
