'use strict';

//fetch and api variables

const apiNPS = 'IfcsBFYkZPOU1J024K3TaNhMYXtHZ7bCHqZhtxrP';
const urlNPS = 'https://developer.nps.gov/api/v1/campgrounds';
const apiWthr = 'ghBbVfHMkzWpDb2k4bL8SrbRvcUFJd';
const urlWthr = 'https://www.amdoren.com/api/weather.php';

//function to format query format query parameters

function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

//function to render html

function displayResults(responseJson, responseJson2) {
  console.log(responseJson)
  console.log(responseJson2)
  $('#results-list').empty();
  for (let i=0; i < responseJson.data.length; i++){
    $('#results-list').append(
      `<li><h3>${responseJson.data[i].name}</h3>
      <p>State: ${responseJson.data[i].addresses.stateCode}
      <p>Designation: ${responseJson.data[i].accessibility.classifications}</p>
      <p>Description: ${responseJson.data[i].description}</p>
      <p>Weather Info: ${responseJson.data[i].weatherOverview}</p>
      <p>Forecast: ${responseJson2.forecast}</p>
      <p>Directions: ${responseJson.data[i].directionsUrl}</p>
      <p>Website: ${responseJson.data[i].reservationsUrl}</p>
      </li>`
    )};
  $('#results').removeClass('hidden');
};

//function to set api 1 params

function getNPSResults(query) {
  const params = {
    stateCode: query,
    limit: 5,
    fields: "addresses",
    api_key: apiNPS
  };

//function to call api 1

const queryString1 = formatQueryParams(params)
const url1 = urlNPS + '?' + queryString1;

console.log(url1);

fetch(url1)
  .then(response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error(response.statusText);
  })
  .catch(err => {
    $('#js-error-message').text(`Something went wrong: ${err.message}`);
  });

  //function to set api 2 params

  function getResults(query) {
    //const to set up lat and lon as references of api1 lat and lng results
    const resultLat =;
    const resultLon = ;
    //
    const params = {
      api_key: apiWthr,
      lat: resultLat,
      lon: resultLon
    };

//function to call api 2

const queryString2 = formatQueryParams(params)
const url2 = urlWthr + '?' + queryString2;

console.log(url2);

fetch(url2)
  .then(response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error(response.statusText);
  })
  .catch(err => {
    $('#js-error-message').text(`Something went wrong: ${err.message}`);
  });




/*To Do:

Determine where I need to set up displayResults. It is after both Get requests,
but is it inside of the second fetch, or after, and how?

Determine how to reference the lat and lng info from api1 in api2's Get request

Establish pages navigation feature

Determine how to utilize multiple endpoints of the same API (ex. Campgrounds and
alerts)

Expand result information displayed

Determine how to use multiple search parameters for search bar (ex. stateCode and
q (query))
*/
