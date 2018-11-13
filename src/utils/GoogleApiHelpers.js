
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
