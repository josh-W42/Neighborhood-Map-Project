import React, { Component } from 'react';
import {Map, Marker, InfoWindow} from 'google-maps-react';
import {searchNearby} from './utils/GoogleApiHelpers.js';
import SideUI from './SideUI.js';

class MapContainer extends Component {

  state = {
    places: [],
    map: {},

    infoWindowOpen: false,
    activeMarker: {},
    activePlace: {},

  }

  onMarkerClick = (props, marker, e) => {
    this.setState({
      activePlace: props.placeData,
      infoWindowOpen: true,
      activeMarker: marker
    });
  }

  onReady(mapProps, map) {
    new Promise((resolve) => {
      this.setCurrentLocation(map, resolve)
    })
    .then(() => {
      this.setState({
        map: map
      });
      const {google} = this.props;
      const options = {
        location: map.center,
        radius: '1000',
        type: ['point_of_interest']
      }
      searchNearby(google, map, options)
      .then((results) => {
        this.setState({
          places: results
        });
      }).catch((response, status) => {
        alert("Error in Nearby Search");
        console.log(status);
        console.log(response);
      });
    });
  }

  setCurrentLocation(map, callback) {
    // returns an object with lat lng props

    let options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    function error(error) {
      alert('Geolocation Serivce Failed, using default location');
      console.warn(`ERROR(${error.code}): ${error.message}`);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        let cord = position.coords;
        let location = {
          lat: cord.latitude,
          lng: cord.longitude
        };
        map.setCenter(location);
        callback();
      }, error, options);
    } else {
      alert('Geolocation Unavalible, using default location');
      console.log('Geolocation Unavalible, using default location');
      callback();
    }
  }


  render() {

    return (
      <div>
        <SideUI
          google={this.props.google}
          places={this.state.places}
          map={this.state.map}
          onMapUpdate={ (places) => this.setState({ places: places }) }
          onResultClick={ (place) => {
            this.setState({
              activePlace: place,
              infoWindowOpen: false
             });
          }}
          />
        <Map
          clickableIcons={true}
          fullscreenControl={false}
          mapTypeControl={false}
          onReady={this.onReady.bind(this)}
          google={this.props.google}
          zoom={16}
          >
          {
            this.state.places.map( (place) =>
              {
                return (
                  <Marker
                    key={place.id}
                    placeData={place}
                    onClick={this.onMarkerClick}
                    position={{
                      lat: place.geometry.location.lat(),
                      lng: place.geometry.location.lng()
                    }}
                    animation={
                      (this.state.activePlace === place) ? (
                        this.props.google.maps.Animation.BOUNCE
                      ):""
                    }
                    name={place.name}
                    />
                )
              }
             )
          }
          <InfoWindow
            marker={this.state.activeMarker}
            visible={this.state.infoWindowOpen}
            onClose={ () => this.setState({
              infoWindowOpen: false,
              activePlace: {},
              activeMarker: {},
            })}
          >
          <div>
            <h3>{this.state.activePlace.name}</h3>
            <p>
              {
                (this.state.activePlace) ? (
                  (this.state.activePlace.vicinity) ? (
                    this.state.activePlace.vicinity
                  ):(
                    this.state.activePlace.formatted_address
                  )): ""
              }
            </p>
          </div>
          </InfoWindow>
        </Map>
      </div>
    );
  }
}

export default MapContainer
