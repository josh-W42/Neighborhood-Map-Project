import React, { Component } from 'react';
import {Map, InfoWindow, Marker} from 'google-maps-react';

class MapContainer extends Component {

  onMarkerClick() {
    console.log(this);
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

        <Marker onClick={this.onMarkerClick}
                animation={this.props.google.maps.Animation.DROP}
                position={{
                    lat: 34.063793,
                    lng: -118.445796
                  }}
                name={'Current location'}

                />

        <InfoWindow onClose={this.onInfoWindowClose}>
            <div>
              <h1>Hello</h1>
            </div>
        </InfoWindow>
      </Map>
    );
  }
}

export default MapContainer
