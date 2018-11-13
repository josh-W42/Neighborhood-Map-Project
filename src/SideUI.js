import React, { Component } from 'react';
import { searchFor, searchNearby } from './utils/GoogleApiHelpers.js'


class SideUI extends Component {

  /*
   This function is called when a user uses the text input field in sideUI
   Makes a call to the google maps places api
  */
  onSearch(input) {

    const map = this.props.map;
    const {google} = this.props;
    const options = {
      input: input,
      location: map.center,
      radius: '500'
    }
    searchFor(google, map, options)
    .then((results) => {
      this.props.onMapUpdate(results);
      this.props.map.panTo({
        lat: results[0].geometry.location.lat(),
        lng: results[0].geometry.location.lng()
      });
    }).catch((response, status) => {
      this.props.onMapUpdate(response);
      alert("No Search Results");
      console.log(status);
      console.log(response);
    });
  }

  /*
    This function is called when users select from the sideUI table.
    Makes a call to the google maps place api
  */
  onNearbySearch(catagory) {

    const map = this.props.map;
    const {google} = this.props;

    let options = {
      location: map.center,
      radius: '2000',
      rankby: 'distance'
    }

    switch (catagory) {
      case 'food':
        options.keyword = ['food'];
        break;
      case 'beauty':
        options.keyword = ['spa'];
        break;
      case 'banking':
        options.keyword = ['finance', 'bank', 'atm'];
        break;
      case 'educational':
        options.keyword = ['school', 'library', 'museum'];
        break;
      case 'entertainment':
        options.keyword = ['theater'];
        break;
      default:
        alert("Error in Filter Search");
    }

    searchNearby(google, map, options)
    .then((results) => {
      this.props.onMapUpdate(results);
    }).catch((response, status) => {
      this.props.onMapUpdate(response);
      console.log(status);
      console.log(response);
    });
  }

  resultClick(place) {
    this.props.map.panTo({
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    });
    this.props.onResultClick(place);
  }

  render() {

    return (
      <div id="sideUI">
        <div className="mainUISection">
          <h1>What would you like to search?</h1>
          <form>
            <input
              className="searchInput"
              type="text"
              placeholder="Name of Venue or Address"
            />
            <input
              className="searchSubmitBtn"
              value="Search"
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                this.onSearch(document.querySelector('.searchInput').value);
              }} />
          </form>

          <h2>Search Nearby results by type:</h2>
          <form onChange={ (e) => this.onNearbySearch(e.target.value) }>
            <table id="inputTable">
              <tbody>
                <tr>
                  <td tabIndex="0">
                    <label htmlFor="food">Food</label>
                    <input type="radio" name="searchType" id="food" value="food" />
                  </td>
                  <td tabIndex="0">
                    <label htmlFor="banking">Banking</label>
                    <input type="radio" name="searchType" id="banking" value="banking" />
                  </td>
                  <td tabIndex="0">
                    <label htmlFor="beauty">Beauty</label>
                    <input type="radio" name="searchType" id="beauty" value="beauty" />
                  </td>
                  <td tabIndex="0">
                    <label htmlFor="entertainment">Entertainment</label>
                    <input type="radio" name="searchType" id="entertainment" value="entertainment" />
                  </td>
                  <td tabIndex="0">
                    <label htmlFor="educational">Educational</label>
                    <input type="radio" name="searchType" id="educational" value="educational" />
                  </td>
                </tr>
              </tbody>
            </table>
          </form>

          <h2>Results:</h2>
          <div className="resultsContainer">
            {
              (this.props.places.length === 0) ? (
                <p>No results found</p>
              ) : ("")
            }
            {this.props.places.map( (place) => (
              <div
                tabIndex="0"
                key={place.id}
                className="result"
                onKeyUp={(e) => {
                  if(e.keyCode === 13) {
                    this.resultClick(place);
                  }
                }}
                onClick={() => {
                  this.resultClick(place);
                }}
              >
                <img
                  className="businessImage"
                  src={place.icon}
                  alt={place.name}
                />
                <div className='businessInfo'>
                  <h3 className="businessName">{place.name}</h3>
                  <p className="businessAddress">
                    { (place.vicinity) ? place.vicinity:place.formatted_address }
                  </p>
                  <p className='businessOpen'>
                    { (place.opening_hours) ? `Is currently: ${(place.opening_hours.open_now) ? 'Open':'Closed' }` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
        <div className="hamburgerSection">
          <div id="hamburger"></div>
        </div>
      </div>
    );
  }
}

export default SideUI
