'use strict';

const songkickApiKey = '';
const spotifyClientId = '6d0a3f2dec5a466b8d8744b0376d8e1f';
const spotifyClientSecret = '3be3513498f6445ea007cacefa3df2cd';

const songkickLocationBase = 'https://api.songkick.com/api/3.0/search/locations.json?';
const spotifySearchBase = 'https://api.spotify.com/v1/search';

//Get metro ID using location API
function getMetroID(city, startDate, endDate) {
    const params = {
        // apikey = songkickApiKey,
        q: city
    };
    const queryString = formatParams(params);
    const url = songkickLocationBase + queryString;

    fetch(url)
    .then(response => {
        if (response.ok) {
            return response.json();
        } throw new Error(response.statusText)
    })
    .then(responseJson => getConcerts(responseJson.resultsPage.results.location[0].metroArea.id, startDate, endDate))
    .catch(error => {
        $('#error').text(`Something Went Wrong: ${error.message}`);
    });

}

//Get list of concerts from Songkick
function getConcerts(metroID, startDate, endDate) {
    const params = {
        apikey: songkickApiKey,
        metro_area_id: metroID,
        min_date: startDate,
        max_date: endDate
    };

    queryString = formatParams(params);
    const url = `https://api.songkick.com/api/3.0/metro_areas/${metroID}/calendar.json?` + queryString;

    //call fetch here with url
    fetch(url)
    .then(response => {
        if(response.ok) {
            return response.json();
        } throw new Error(response.statusText);
    })
    .then(responseJson => displayConcerts(responseJson))
    .catch(error => {
        $('#error').text(`Something Went Wrong: ${error.message}`);
    });
}

//Format the params into the query string
function formatParams(params) {
    const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

function displayConcerts(responseJson) {
    $('#concert-results').empty();
    for (let i = 0; i < responseJson.resultspage.results.event.length; i++){
        //create <li> for each concert here
        $('#concert-results').append(
            `<li>
                <p class="artist-name">${responseJson.resultspage.results.event[1][0].displayName}</p>
                <p class="concert-date">${responseJson.resultspage.results.event[0].start.date}</p>
                <p class="venue">${responseJson.resultspage.results.event[3].displayName}</p>
            </li>`
        );
    };
}

//Call the Spotify Search API to obtain the artist's URI used to generate the player
function getArtistURI(artistName){
    getAccessToken();
    const params = {
        q: artistName
    };

    const options = {
        headers: new Headers({
            "Authorization": "Bearer" + accessToken
        })
    };

    const queryString = formatParams(params);
    const url = spotifySearchBase + '?' + queryString;

    fetch(url, options)
    .then(response => {
        if (response.ok) {
            return response.json();
        } throw new Error(response.statusText);
    })
    .then(responseJson => generatePlayer(responseJson.artists.items.id))
    .catch(error => {
        $('#error').text(`Something Went Wrong ${error.message}`);
    });
}

//use client credentials flow to get access_token required for call to Search API
function getAccessToken(){
    $.ajax({
        type: "POST",
        url: "https://accounts.spotify.com/api/token",
        beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + 'NmQwYTNmMmRlYzVhNDY2YjhkODc0NGIwMzc2ZDhlMWY6IDNiZTM1MTM0OThmNjQ0NWVhMDA3Y2FjZWZhM2RmMmNk');
        },
        data: {grant_type: client_credentials},
        error: function(xhr, error) {
            console.log(error.message);
        },
        success: function(data) {
            let response = data.json();
            let accessToken = response.access_token;
            return accessToken;
        }
    });
}

function generatePlayer(artistURI){
    const player = ` <iframe src="https://open.spotify.com/embed/artist/${artistURI}" 
    width="300" height="380" frameborder="0" allowtransparency="true" 
    allow="encrypted-media"></iframe>`;

    $('#spotify-player').html(player);
}

function handleSubmit(){
    $('#submit').on('click', event => {
        event.preventDefault();
        const city = $('input[name=location]').val();
        const startDate = $('input[name=start-date]').val();
        const endDate = $('input[name=end-date]').val();
        getMetroID(city, startDate, endDate);
    });
}

//event listener for user clicking on artist name
function handleArtistClick() {
    $('#concert-results').on('click', '.artist-name', event => {
        event.preventDefault();
        let artistName = $('.artist-name').text();
        console.log(artistName);
        // getArtistURI(artistName);
    });
}

function runApp() {
    handleSubmit();
    handleArtistClick();
}

$(runApp);