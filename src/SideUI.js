import React, { Component } from 'react';
import { searchFor, searchNearby } from './utils/GoogleApiHelpers.js'


class SideUI extends Component {

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
    }).catch((response, status) => {
      console.log(status);
      console.log(response);
    });
  }

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
        options.keyword = ['beauty', 'hair_salon'];
        break;
      case 'banking':
        options.keyword = ['finance', 'bank', 'atm'];
        break;
      case 'educational':
        options.keyword = ['school', 'library', 'museum'];
        break;
      case 'entertainment':
        options.keyword = ['stadium', 'campground'];
        break;
      default:
        alert("i'm not working");
    }

    searchNearby(google, map, options)
    .then((results) => {
      this.props.onMapUpdate(results);
    }).catch((response, status) => {
      console.log(status);
      console.log(response);
    });
  }

  render() {

    return (
      <div id="sideUI">
        <div className="mainUISection">
          <h1>What would you like to search?</h1>
          <form>
            <input className="searchInput" type="text" placeholder="Name of Venue or Address"/>
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
              <tr>
                <td>
                  <input type="radio" name="searchType" id="food" value="food" defaultChecked />
                  <label for="food">Food</label>
                </td>
                <td>
                  <input type="radio" name="searchType" id="banking" value="banking" />
                  <label for="banking">Banking</label>
                </td>
                <td>
                  <input type="radio" name="searchType" id="beauty" value="beauty" />
                  <label for="beauty">Beauty</label>
                </td>
              </tr>
              <tr>
                <td>
                  <input type="radio" name="searchType" id="entertainment" value="entertainment" />
                  <label for="entertainment">Entertainment</label>
                </td>
                <td>
                  <input type="radio" name="searchType" id="educational" value="educational" />
                  <label for="educational">Educational</label>
                </td>
              </tr>
            </table>
          </form>

          <h2>Results:</h2>
          <div className="resultsContainer">
            {this.props.places.map( (place) => (
              <div
                key={place.id}
                className="result"
                onClick={() => {
                  this.props.map.panTo({
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                  });
                }}
                >
                <img
                  className="businessImage"
                  src={place.icon}
                  alt={place.name} />
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
