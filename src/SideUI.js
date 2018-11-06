import React, { Component } from 'react';
import { searchFor } from './utils/GoogleApiHelpers.js'


class SideUI extends Component {

  onSearch(input) {
    const map = this.props.map;

    const {google} = this.props;
    const options = {
      location: map.center,

    }
    searchFor(google, map, options)
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
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                this.onSearch(document.querySelector('.searchInput').value);
              }} />
          </form>

          <h2>Get results by type:</h2>
          <form>
            <input type="radio" name="searchType" id="Food" value="Food" defaultChecked />
            <label for="Food">Food</label>

            <input type="radio" name="searchType" id="Beauty" value="Beauty" />
            <label for="Beauty">Beauty</label>

            <input type="radio" name="searchType" id="Finances" value="Finances" />
            <label for="Finances">Finances</label>

            <input type="radio" name="searchType" id="Entertainment" value="Entertainment" />
            <label for="Entertainment">Entertainment</label>

            <input type="radio" name="searchType" id="Educational" value="Educational" />
            <label for="Educational">Educational</label>
          </form>

          <h2>Results:</h2>
          <div className="resultsContainer">
            {this.props.places.map( (place) => (
              <div key={place.id} className="result">
                <img className="businessImage" src={place.icon} alt={place.name} />
                <h3 className="businessName">{place.name}</h3>
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
