import React, { Component } from 'react';
import backupResults from './utils/backupLocations.js';
import { searchFor, searchNearby } from './utils/GoogleApiHelpers.js';

var foursquare = require('react-foursquare')({
  clientID: process.env.REACT_APP_FOURSQUARE_CLIENT_ID,
  clientSecret: process.env.REACT_APP_FOURSQUARE_CLIENT_SECRET
});

class SideUI extends Component {


  state = {
    activeRadio: '',
    places: this.props.places,

    filteredArrayReady: false,

    searchType: 'foursquare',
  }


  /*
   This function is called when a user uses the text input field in sideUI
   uses foursquare explore call or google places Api search
  */
  onSearch(input) {

    this.setState({
      places: this.props.places,
      filteredArrayReady: false
     });
    this.props.onFilterClose();

    const map = this.props.map;


    if(this.state.searchType === "foursquare") {
      const options = {
        ll: `${map.center.lat()}, ${map.center.lng()}`,
        query: input,
        sortByDistance: 1,
      }


      foursquare.venues.explore(options)
      .then((results) => {
        if(results.meta.code === 200) {
          if(results.response.totalResults > 0) {
            this.props.onMapUpdate(results.response.groups[0].items);
            this.props.map.panTo({
              lat: results.response.groups[0].items[0].venue.location.lat,
              lng: results.response.groups[0].items[0].venue.location.lng
            });
          } else {
            alert(results.response.warning.text);
          }
        } else {
          console.log('Api Requst Failure');
          this.googlePlaceSearch(input, map);
        }
      }).catch((response, status) => {
        console.log('Dual Api request Failure, using backupResults');
        console.log(status);
        console.log(response);
        this.backupSearch(input);
      });
    } else if (this.state.searchType === "google") {
      this.googlePlaceSearch(input, map);
    }
  }

  googlePlaceSearch(input, map) {
    const options = {
      location: {
        lat: map.center.lat(),
        lng: map.center.lng()
      },
      query: input,
      radius: 1000,
    }

    searchFor(this.props.google, map, options).then((results) => {
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
      console.log(results)
      this.props.onMapUpdate(formatedResults);
      this.props.map.panTo({
        lat: formatedResults[0].venue.location.lat,
        lng: formatedResults[0].venue.location.lng
      });
    }).catch((error) => {
      console.log("Error in Google Place API Search")
    })
  }

  /*
    This function should give functionality to the search feature but will only
    apply to the small database of backup locations.
  */
  backupSearch(query){
    let results = [];
    Object.keys(backupResults).forEach((key) => {
      backupResults[key].forEach((place) => {
        const placeName = place.venue.name.toLowerCase();
        const nameContainsQuery = placeName.includes(query.toLowerCase());
        const placeCategory = place.venue.categories[0].name.toLowerCase();
        const catagoryContainsQuery = placeCategory.includes(query.toLowerCase());
        if (nameContainsQuery || catagoryContainsQuery || key === query.toLowerCase()) {
          results.push(place);
        }
      });
    });
    if(results.length === 0) {
      alert("No Search Results, try searching 'food' or 'store'");
    } else {
      this.props.onMapUpdate(results);
    }
  }

  /*
    This function is called when users select from the sideUI table.
    Uses foursquare explore call
  */
  onNearbySearch(catagory) {

    this.setState({
      places: this.props.places,
      filteredArrayReady: false
    });
    this.props.onFilterClose();

    // Request for Foursquare API
    let optionsFS = {
      ll: `${this.props.map.center.lat()}, ${this.props.map.center.lng()}`,
      radius: '1000',
    }

    // Request for google place API, if needed
    let optionsGP = {
      location: {
        lat: this.props.map.center.lat(),
        lng: this.props.map.center.lng()
      },
      radius: 1000,
    }

    let backup;

    switch (catagory) {
      case 'food':
        this.setState({ activeRadio: 'food' });
        optionsFS.section = 'food';
        optionsGP.keyword = 'food';
        backup = backupResults.food;
        break;
      case 'arts':
        this.setState({ activeRadio: 'arts' });
        optionsFS.section = 'arts'
        optionsGP.keyword = 'arts';
        backup = backupResults.arts;
        break;
      case 'shopping':
        this.setState({ activeRadio: 'shops' });
        optionsFS.section = 'shops'
        optionsGP.keyword = 'shopping';
        backup = backupResults.shops;
        break;
      case 'popular':
        this.setState({ activeRadio: 'trending' });
        optionsFS.section = 'trending';
        optionsGP.type = 'point_of_interest';
        backup = backupResults.trending;
        break;
      default:
        alert("Error in Filter Search");
    }

    foursquare.venues.explore(optionsFS)
    .then((results) => {
      if(results.meta.code === 200) {
        if(results.response.totalResults > 0) {
          this.props.onMapUpdate(results.response.groups[0].items);
        } else {
          alert(results.response.warning.text);
        }
      } else {
        console.log('Foursquare Api Request Failure, using Google Places Api values');

        let map = this.props.map;

        /*
          I format all the results from the google maps api to appear like results
          from the foursquare api, but these results have more information
          that you can take advantage of later (prive_level, opening_hours etc)
        */
        searchNearby(this.props.google, map, optionsGP).then((results) => {
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
          this.props.onMapUpdate(formatedResults);
        }).catch(() => {
            console.log("Dual Api request failure, using backup results from default");
            this.props.onMapUpdate(backup)
        }
      )
      }
    });
  }

  /*
    This is a helper function for getting a place icon from the foursquare api
    to grab a picture from foursquare, you must connect a prefix api call, the
    diminsions of the image and the sulfix of the api call. Additionally "bg_"
    is used to specify that the icon has a background.
  */
  getPlaceIcon(place) {
    if(place.venue.isFromGoogle) {
      return place.venue.icon
    }
    if(place.venue.categories.length > 0) {
      const placeIcon = place.venue.categories[0].icon;
      const iconUrl = `${placeIcon.prefix}bg_64${placeIcon.suffix}`;
      return(iconUrl);
    } else {
      return ""
    }
  }

  onFilterSelect(filterOption) {
    if(filterOption === 'No Filter') {
      this.setState({
        filteredArrayReady: false,
        places: this.props.places
      });
      this.props.onFilterClose();
    } else {
      const filteredArray = this.props.places.filter(
        (place) => place.venue.categories[0].name.includes(filterOption) || place.venue.name.includes(filterOption)
      );
      this.setState({
        filteredArrayReady: true,
        places: filteredArray
      });
      this.props.onFilterUpdate(filteredArray);
    }
  }

  render() {

    let placeArray;
    if(this.state.filteredArrayReady) {
      placeArray = this.state.places;
    } else {
      placeArray = this.props.places;
    }

    return (
      <div id="sideUI">
        <div className="mainUISection">
          <h1 tabIndex="0">What would you like to search for?</h1>
            <h2 tabIndex="0">Search Type:</h2>
            <select role="combobox" aria-controls="" aria-expanded
              onChange={(e) => this.setState({ searchType: e.target.value })}>
              <option value="foursquare">Venue or Category</option>
              <option value="google">Address or Location</option>
            </select>
          <form>
            <input
              className="searchInput"
              type="text"
              placeholder="Ex. Tacos, Movies, Parks"
            />
            <input
              aria-label="Search button"
              className="searchSubmitBtn"
              value="Search"
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                this.onSearch(document.querySelector('.searchInput').value);
              }} />
          </form>

          <h2 tabIndex="0">Search Nearby results by type:</h2>
          <form onChange={ (e) => this.onNearbySearch(e.target.value) }>
            <table id="inputTable">
              <tbody>
                <tr>
                  <td tabIndex="0">
                    <label htmlFor="food">Food</label>
                    <input type="radio" name="searchType" id="food" value="food" />
                  </td>
                  <td tabIndex="0">
                    <label htmlFor="arts">Artistic</label>
                    <input type="radio" name="searchType" id="arts" value="arts" />
                  </td>
                  <td tabIndex="0">
                    <label htmlFor="popular">Popular Locations</label>
                    <input type="radio" name="searchType" id="popular" value="popular" />
                  </td>
                  <td tabIndex="0">
                    <label htmlFor="shopping">Shopping</label>
                    <input type="radio" name="searchType" id="shopping" value="shopping" />
                  </td>
                </tr>
              </tbody>
            </table>
          </form>

          {
            (this.state.activeRadio === 'food') ? (
              <div>
                <h3 tabIndex="0">Filter Food by Cuisine:</h3>
                <select role="combobox" aria-controls="" aria-expanded onChange={(e) => this.onFilterSelect(e.target.value)}>
                  <option>No Filter</option>
                  <option>Italian</option>
                  <option>Pizza</option>
                  <option>American</option>
                  <option>Mexican</option>
                  <option>Sushi</option>
                </select>
              </div>
            ):("")
          }
          {
            (this.state.activeRadio === 'arts') ? (
              <div>
                <h3 tabIndex="0">Filter Venues by Type:</h3>
                <select role="combobox" aria-controls="" aria-expanded onChange={(e) => this.onFilterSelect(e.target.value)} >
                  <option>No Filter</option>
                  <option>Dance</option>
                  <option>Theater</option>
                  <option>Music Venue</option>
                  <option>Art Gallery</option>
                  <option>Museum</option>
                </select>
              </div>
            ):("")
          }
          {
            (this.state.activeRadio === 'shops') ? (
              <div>
                <h3 tabIndex="0">Filter Shops by Type:</h3>
                <select onChange={(e) => this.onFilterSelect(e.target.value)}>
                  <option>No Filter</option>
                  <option>Bookstore</option>
                  <option>Shopping Mall</option>
                  <option>Cosmetics Shop</option>
                  <option>Clothing Store</option>
                  <option>Grocery Store</option>
                </select>
              </div>
            ):("")
          }

          <h2 tabIndex="0">Results:</h2>
          <div className="resultsContainer">
            {
              (placeArray.length === 0) ? (
                <p>No results found</p>
              ) : ("")
            }
            {
              placeArray.map( (place) => (
              <div
                tabIndex="0"
                key={place.venue.id}
                className="result"
                onKeyUp={(e) => {
                  if(e.keyCode === 13) {
                    this.resultClick(place);
                  }
                }}
                onClick={() => {
                  this.props.map.panTo({
                    lat: place.venue.location.lat,
                    lng: place.venue.location.lng
                  });
                  this.props.onResultClick(place);;
                }}
              >
              <img
                tabIndex="0"
                className="businessImage"
                src={this.getPlaceIcon(place)}
                alt={place.venue.name}
              />
                <div className='businessInfo'>
                  <h3 tabIndex="0" className="businessName">{place.venue.name}</h3>
                  <p>{
                      (place.venue.categories.length > 0) ? (
                        place.venue.categories[0].name
                      ):("")
                    }</p>
                  <p tabIndex="0" className="businessAddress">
                    {place.venue.location.formattedAddress}
                  </p>
                  <p className='businessOpen'>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default SideUI
