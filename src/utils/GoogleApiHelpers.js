
export function searchNearby(google, map, request) {
  return new Promise((resolve, reject) => {
    const service = new google.maps.places.PlacesService(map);

    service.nearbySearch(request, (results, status, pagination) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {

        resolve(results, pagination);
      } else {
        reject(results, status);
      }
    })
  });
}


export function reverseGeoCode(google, location) {
  return new Promise((resolve, reject) => {
    const service = new google.maps.Geocoder();

    service.geocode({location: location}, (results, status) => {
      if(status === google.maps.places.PlacesServiceStatus.OK) {
        if (results[0]) {
          resolve(results);
        } else {
          console.log("No results for location");
        }
      } else {
        reject(status);
      }
    })
  })
}

export function searchFor(google, map, request) {
  return new Promise((resolve, reject) => {
    const service = new google.maps.places.PlacesService(map);

    service.textSearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {

        resolve(results);
      } else {
        reject(results, status);
      }
    })
  });
}
