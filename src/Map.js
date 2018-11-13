import React, { Component } from 'react';
import {Map, Marker, InfoWindow} from 'google-maps-react';
import SideUI from './SideUI.js';

var foursquare = require('react-foursquare')({
  clientID: process.env.REACT_APP_FOURSQUARE_CLIENT_ID,
  clientSecret: process.env.REACT_APP_FOURSQUARE_CLIENT_SECRET
});


class MapContainer extends Component {

  state = {
    places: [],
    map: {},

    infoWindowOpen: false,
    activeMarker: {},
    activePlace: {},

  }

  // This function will asign a marker as 'active', so that its' data can
  // be made avalible to other components, like info window
  onMarkerClick = (props, marker, e) => {
    this.setState({
      activePlace: props.placeData,
      infoWindowOpen: true,
      activeMarker: marker,

      filteredArray: [],

      filteredArrayReady: false
    });
  }

  /*
    When the google map is ready, it will attempt to get the current location
    of the device and then preform a local search for places that may be
    of interest.
   */
  onReady(mapProps, map) {
    new Promise((resolve) => {
      this.setCurrentLocation(map, resolve)
    })
    .then(() => {
      this.setState({
        map: map
      });
      const options = {
        ll: `${map.center.lat()}, ${map.center.lng()}`,
        radius: '1000',
      }

      foursquare.venues.explore(options)
      .then( (results) => {
        this.setState({
          places: results.response.groups[0].items
        })
      })
      .catch( (error) => {
          alert("Error in Nearby Search");
          console.log(error);
      });
    });
  }

 /*
   Sets the center location for the map.

   If geolocation is not avalible for this browser or access is denied, the
   default google maps location, san fransisco, CA will be used.
 */
  setCurrentLocation(map, callback) {

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

  getDevliveryIcon(place) {
    const providerIcon = place.venue.delivery.provider.icon;
    const iconUrl = `${providerIcon.prefix}${providerIcon.sizes[0]}${providerIcon.name}`;
    return(iconUrl);
  }


  render() {

    let placeArray;
    if(this.state.filteredArrayReady) {
      placeArray = this.state.filteredArray;
    } else {
      placeArray = this.state.places;
    }

    return (
      <div>
        <SideUI
          google={this.props.google}
          places={this.state.places}
          map={this.state.map}
          onFilterClose={ () => this.setState({ filteredArrayReady: false }) }
          onFilterUpdate={ (filterdPlaces) => this.setState({
            filteredArray: filterdPlaces,
            filteredArrayReady: true
          })}
          onMapUpdate={ (places) => this.setState({places: places.response.groups[0].items }) }
          onResultClick={ (place) => {
            this.setState({
              activePlace: place.venue,
              infoWindowOpen: false
             });
          }}
          />
        <Map
          role="application"
          tabindex="0"
          clickableIcons={true}
          fullscreenControl={false}
          mapTypeControl={false}
          onReady={this.onReady.bind(this)}
          google={this.props.google}
          zoom={16}
          >
          {
            placeArray.map( (place) =>
              {
                return (
                  <Marker
                    tabIndex="0"
                    key={place.venue.id}
                    placeData={place}
                    onClick={this.onMarkerClick}
                    position={{
                      lat: place.venue.location.lat,
                      lng: place.venue.location.lng
                    }}
                    animation={
                      (this.state.activePlace === place.venue) ? (
                          this.props.google.maps.Animation.BOUNCE
                        ):("")
                    }
                    name={place.venue.name}
                    />
                )
              }
             )
          }
          <InfoWindow
            role="dialog"
            marker={this.state.activeMarker}
            visible={this.state.infoWindowOpen}
            onClose={ () => this.setState({
              infoWindowOpen: false,
              activePlace: {},
              activeMarker: {},
            })}
          >
          {
            (this.state.places.includes(this.state.activePlace)) ? (

              <div className="infoWindow">
                <h3 tabIndex="0">{this.state.activePlace.venue.name}</h3>
                {
                  (this.state.activePlace.venue.delivery) ? (
                    <div className="deliveryOptions">
                      <p tabIndex="0" className="deliveryMessage">
                        {
                          `Delivery options provided by
                          ${this.state.activePlace.venue.delivery.provider.name}!
                          Click the icon on the left for more info`
                        }
                      </p>
                      <a tabIndex="0" href={this.state.activePlace.venue.delivery.url}>
                        <img
                          className="deliveryLinkImg"
                          tabIndex="0"
                          src={this.getDevliveryIcon(this.state.activePlace)}
                          alt={
                            `Delivery link from
                            ${this.state.activePlace.venue.delivery.provider.name}`
                          }
                        />
                      </a>
                    </div>
                  ):("")
                }
                <p tabIndex="0" className="infoWindowCatagory">
                  {
                    (this.state.activePlace.venue.categories.length > 0) ? (
                      this.state.activePlace.venue.categories[0].name
                    ):("")
                  }
                </p>
                <p tabIndex="0" className="infoWindowAddress">
                  {this.state.activePlace.venue.location.formattedAddress}
                </p>
              </div>
            ):(<div></div>)
          }
          </InfoWindow>
        </Map>
      </div>
    );
  }
}

export default MapContainer
