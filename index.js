'use strict';

//fetch and api variables

const apiNPS ='IfcsBFYkZPOU1J024K3TaNhMYXtHZ7bCHqZhtxrP';
const urlNPS ='https://developer.nps.gov/api/v1/campgrounds';
const apiWthr ='bef3fc1d798647285a40a276507cf08a';
const urlWthr ='https://api.weatherunlocked.com/api/forecast/us.';
const idWthr ='133c3d86';

var parks = [];
class Park {
  constructor(park, weather) {
    this.park_data = park;
    this.weather_data = weather;
  }
}

function getParks() {
  let queryString = formatQueryParams({
    stateCode: $('#js-search-term').val(),
    limit: $('#query-limit').find("option:selected").val(),
    fields: "addresses",
    api_key: apiNPS
  });
  let url = urlNPS + '?' + queryString;
  $('#js-error-message').text('');
  $('#result_count').text('');
  $('.title-wrap > .loader').addClass('loading');
  parks = [];
  $('#search-button').attr('disabled', true);

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(function(response) {
      $('#park_results').html('');
      $('#search-button').attr('disabled', false);
      if(!response || !response.hasOwnProperty('data') || !response.data.hasOwnProperty('length')){
        throw new Error('Returned data has no length!');
      }

      $('#result_count').text(response.data.length);
      for (let i=0; i<response.data.length; i++) {
        let item = response.data[i];
        let name = '';
        name = item['name'];
        if(item && name){

          if(!item.hasOwnProperty('addresses')){
            console.log('this result is missing the "addresses" field!');
          }else{
            $('#park_results').append('<div class="row" data-park-id="'+i+'"></div>');
            getWeather(item, i);
          }

        }else{
          console.log('oops! something went wrong with this one:');
          console.log(item)
        }

        if(i === response.data.length - 1){
        }
      }
    })
    .catch(err => {
      console.log('error happened');
      console.log(err);
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    })
    .finally( () => {
      $('.title-wrap > .loader').removeClass('loading');
    });
}

function getWeather(target_item, index){

  if(!target_item || !target_item.hasOwnProperty('addresses')){
    console.log('there is no target_item!');
    return false;
  }

  const queryString = formatQueryParams({
    app_id:idWthr,
    app_key:apiWthr
  });

  let location_zip;

  if(target_item['addresses'].hasOwnProperty('postalCode')){
    location_zip = target_item['addresses']['postalCode'];// only a single postal code returned
  }else if(target_item['addresses'].hasOwnProperty('length') && target_item['addresses'].length > 0 && target_item['addresses'][0].hasOwnProperty('postalCode')){
    location_zip = target_item['addresses'][0].postalCode; // there are more than 1 zip code supplied,takes the first one
  }
  if(!location_zip){
    console.log('Whoops! No zip code found!');
    console.log(target_item);
    return;
  }
  const url = urlWthr + location_zip + '?' + queryString;
  fetch(url)
    .then( response => {

      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then ( json_resp => {

      if(!json_resp || !json_resp.hasOwnProperty('Days') || !json_resp.Days.hasOwnProperty('length')){
        throw new Error('No forecast days!');
      }

      displayWeather(json_resp, target_item, index); // single target_item passed into display function

    })
    .catch( err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function displayWeather(resp, item, index){
  let forecast = resp['Days'];
  if(!forecast || !forecast.hasOwnProperty('length') || !forecast.length){
    console.log('could not cypher forecast!');
    return;
  }
  let forecast_html = '';
  for (let i=0;i<forecast.length;i++){ // iterate over each day returned
    forecast_html += '<div class="col">';
    forecast_html += '<h5 class="">'+forecast[i]['date']+'</h5>';
    if(forecast[i].hasOwnProperty('Timeframes') && forecast[i].Timeframes.length > 0){ // iterate over each 'Timeframes' received within a day
      for ( let j=0;j<forecast[i].Timeframes.length;j++){
        let timeframe = forecast[i].Timeframes[j];
        forecast_html += '<div>'+timeframe['utctime']+': '+timeframe['wx_desc']+ '</div>';
      }
    }
    forecast_html += '</div>';
  }

  let html = `<div class="col"><h3>${item.name}</h3>
  <p>State: ${item.addresses[0].stateCode}</p>
  <p>Designation: ${item.accessibility.classifications}</p>
  <p>Description: ${item.description}</p>
  <p>Weather Info: ${item.weatheroverview}</p>
  <p>Directions: <a href="${item.directionsUrl}" target="_blank">External Link</a></p>
  <h4>7-Day Forecast</h4>
  <div class="row forecast-row" name="forecast">${forecast_html}</div>
  </div>`;
  $(html).appendTo('[data-park-id='+index+']');

  parks.push(new Park(item, resp)); // stash this in a variable

  $('#results').removeClass('hidden');
}

//function to format query parameters

function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

//form watcher

$(function(){
  $('#js-form').submit(function(e) {
    e.preventDefault();
    getParks();
  });
})
