const apiKey = 'U-RmuQRA3Jqb-NdZFZOu9zz49zuWc-v3ZZd2BKNYOdrYtsCSd3QR-MCgZGQByWG_aQz5vJS2MSHXsqusRx7qeT-r0GjPWKqyWwLHb8IsjJgQGnrj_E8PUo4NdInXW3Yx';

const yelp = require('yelp-fusion');

const client = yelp.client(apiKey);

export function search(request) {
  return new Promise((resolve, reject) => {
    client.search(request).then( (response) => {
      resolve(response);
    }).catch( (e) => {
      reject(e);
    });
  });
}
