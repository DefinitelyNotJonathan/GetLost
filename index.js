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

//function to render both parkObj and weatherObj

function displayResults(parkObj, weatherObj) {
  /*
  @todo implement rendering for both objects
  */
  console.log(parkObj)
  console.log(weatherObj)
  $('#results-list').empty();
  for (let i=0; i <parkObj.data.length; i++){
    $('#results-list').append(
      `<li><h3>${parkObj.data[i].name}</h3>
      <p>State: ${parkObj.data[i].addresses.stateCode}
      <p>Designation: ${parkObj.data[i].accessibility.classifications}</p>
      <p>Description: ${parkObj.data[i].description}</p>
      <p>Weather Info: ${parkObj.data[i].weatherOverview}</p>
      <p>Forecast: ${weatherObj.forecast}</p>
      <p>Directions: ${parkObj.data[i].directionsUrl}</p>
      <p>Website: ${parkObj.data[i].reservationsUrl}</p>
      </li>`
    )};
  $('#results').removeClass('hidden');
}

//function to set api 1 params and send GET request

function getNPSResults(query) {
  const params = {
    stateCode: query,
    limit: 5,
    fields: "addresses",
    api_key: apiNPS
  };
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
    .then(function(parkObj) {
      for (let i=0; i<parkObj.data.length; i++) {
        getWeatherResults(parkObj[i]);
      }
    })
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
  }

  //function to set api 2 params and send GET request

function getWeatherResults(parkObj) {
  const resultLat=parkObj.latLong.lat;
  const resultLong=parkObj.latLong.lng;
  const params= {
    api_key: apiWthr,
    lat: resultLat,
    lon: resultLong
  };
  const queryString2= formatQueryParams(params)
  const url2= urlWthr + '?' + queryString2;
  console.log(url2);
  fetch(url2)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then (weatherObj => {displayResults (parkObj, weatherObj);
    })
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
  }


//form watcher

$(function(){
  $('#js-form').submit(function(e) {
    e.preventDefault();
    getNPSResults($('#js-search-term').val());
  });
})


/*To Do:
Establish pages navigation feature
Expand result information displayed
*/
