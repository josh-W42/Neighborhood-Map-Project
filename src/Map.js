import React, { Component } from 'react';
import {Map, InfoWindow} from 'google-maps-react';
import SideUI from './SideUI.js';
import backupResults from './utils/backupLocations.js';
import { reverseGeoCode, searchNearby } from './utils/GoogleApiHelpers.js';

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

    currentAddress: "",
    currentLocation: {},

    markers: [],

  }

  // This function will asign a marker as 'active', so that its' data can
  // be made avalible to other components, like info window
  onMarkerClick = (props, marker, e) => {
    this.setState({
      activePlace: props.placeData,
      activeMarker: marker,
      infoWindowOpen: true,
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
      this.nearbySearch(map);

      const placeProps = {
        placeData: {
          name: "Current Location"
        }
      }

      let marker = new this.props.google.maps.Marker({
        position: {
          lat: this.state.map.center.lat(),
          lng: this.state.map.center.lng()
        },
        icon: {
          path: this.props.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 5
        },
        map: map,
        animation: this.props.google.maps.Animation.DROP,
      });
      marker.addListener('click', (e) => {
        this.onMarkerClick(placeProps, marker, e)}
      );
      this.createMarkers();
    })
    .catch((message) => {
      this.nearbySearch(map);
      console.log(message);
    })
  }

  // This is an intial search for Places in the local area when map is ready.
  nearbySearch(map) {
    this.setState({
      map: map
    });
    const options = {
      ll: `${map.center.lat()}, ${map.center.lng()}`,
      radius: '1000',
      section: 'trending'
    }

    foursquare.venues.explore(options)
    .then( (results) => {
      if(results.meta.code === 200) {
        if(results.response.totalResults > 0) {
          this.setState({
            places: results.response.groups[0].items
          })
        } else {
          alert(results.response.warning.text);
        }
      } else {

        const options = {
          location: {
            lat: map.center.lat(),
            lng: map.center.lng()
          },
          radius: 1000,
        }

        searchNearby(this.props.google, map, options).then((results) => {
          let formatedResults = []
          results.forEach((result) => {
            const place = {
              venue: {
                name: result.name,
                id: result.id,
                location: {
                  formattedAddress: result.formatted_address,
                  lat: result.geometry.location.lat(),
                  lng: result.geometry.location.lng()
                },
                categories: [
                  {
                    name: result.types[0].replace(/_/gi, " ")
                  }
                ],
                isFromGoogle: true,
                icon: result.icon,
                rating: result.rating,
                opening_hours: result.opening_hours,
                price_level: result.price_level,
              }
            }
            formatedResults.push(place);
          });
          this.setState({ places: formatedResults })
        }).catch((error) => {
          /*
            In the event that the foursquare and Google places api reqeusts fail,
            some genrally popular results will be listed. However, these results are
            only applicable to the default location of the google map.
          */
          console.log("Error in Google Place API Search")
          this.setState({
            places: backupResults.trending
          });
        });
      }
      this.createMarkers();
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
      if(error.code === 504) {
        console.log('Please refresh for current location data');
      }
      callback();
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        let cord = position.coords;
        let location = {
          lat: cord.latitude,
          lng: cord.longitude
        };
        map.setCenter(location);

        reverseGeoCode(this.props.google, {
          lat: cord.latitude,
          lng: cord.longitude
        }).then((result) => {
          location.Address = result[0].formatted_address;
        }).catch((error) => {
          console.log(error);
        });


        this.setState({ currentLocation: location });
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

  createMarkers() {

    if(this.state.markers.length > 0) {
      this.state.markers.forEach((marker) => {
        marker.setMap(null);
      })
    }

    let placeArray = [];
    if(this.state.filteredArrayReady) {
      placeArray = this.state.filteredArray;
    } else {
      placeArray = this.state.places;
    }


    let markers = [];



    placeArray.forEach((place) => {
      const placeProps = {
        placeData: place
      }

      let marker = new this.props.google.maps.Marker({
        position: {
          lat: place.venue.location.lat,
          lng: place.venue.location.lng
        },
        placeData: place,
        map: this.state.map,
      });

      marker.addListener('click', (e) => {
        this.onMarkerClick(placeProps, marker, e);
      });


      markers.push(marker);
    });

    this.setState({ markers });
  }


  render() {

    return (
      <div>
        <SideUI
          google={this.props.google}
          places={this.state.places}
          map={this.state.map}
          currentLocation={this.state.currentLocation}
          onFilterClose={ () => this.setState({ filteredArrayReady: false }) }
          onFilterUpdate={ (filterdPlaces) => {
            this.setState({
              filteredArray: filterdPlaces,
              filteredArrayReady: true
            });
            this.createMarkers();
          }}
          onMapUpdate={ (places) => {
            this.setState({ places });
            this.createMarkers();
          }}
          onResultClick={ (place) => {
            this.state.markers.forEach((marker) => {
              if(marker.getAnimation() === 1) {
                marker.setAnimation(null);
              }
              if(marker.placeData === place){
                marker.setAnimation(this.props.google.maps.Animation.BOUNCE);
                this.onMarkerClick(marker, marker);
              }
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
          <InfoWindow
            role="dialog"
            marker={this.state.activeMarker}
            visible={this.state.infoWindowOpen}
            onClose={ () => {
              this.state.activeMarker.setAnimation(null);
              this.setState({
                infoWindowOpen: false,
                activePlace: {},
                activeMarker: {},
              });
            }
          }
          >
          {
            /*
              Not all data (ratings, open status.. etc) are avalible for every
              search result, thus infoWindows must be structured such that they
              do not trigger errors.
            */
            (this.state.places.includes(this.state.activePlace)) ? (
              <div className="infoWindow">
                <h3 tabIndex="0">{this.state.activePlace.venue.name}</h3>
                {
                  (this.state.activePlace.venue.rating > 0) ? (
                    <p>{`Average Rating: ${this.state.activePlace.venue.rating}/5`}</p>
                  ):("")
                }
                {
                  (this.state.activePlace.venue.opening_hours) ? (
                    <p>
                      {
                        (this.state.activePlace.venue.opening_hours.open_now) ?
                        ("Is Currently: Open"):("Is Currently Closed")
                      }
                    </p>
                  ):("")
                }
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
            ):(
              <div className="infoWindow">
                <h3 tabIndex="0">{this.state.activePlace.name}</h3>
                {
                  (this.state.currentLocation.Address) ? (
                    <p tabIndex="0" className="infoWindowAddress">{`Approximately: ${this.state.currentLocation.Address}`}</p>
                  ):("")
                }
              </div>
            )}
          </InfoWindow>
        </Map>
      </div>
    );
  }
}

/*
{
  this.state.places.map( (place) =>
    {
      return (
        <Marker
          tabIndex="0"
          key={place.venue.id}
          onClick={this.onMarkerClick}
          position={{
            lat: place.venue.location.lat,
            lng: place.venue.location.lng
          }}
          placeData={place}
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

*/

export default MapContainer
