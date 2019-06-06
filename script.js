'use strict';

const songkickApiKey = '';
const spotifyClientSecret = '3be3513498f6445ea007cacefa3df2cd';

const songkickLocationBase = 'https://api.songkick.com/api/3.0/search/locations.json?';
const spotifySearchBase = 'https://api.spotify.com/v1/search';


//Get list of concerts from Songkick
function getConcerts(city, startDate, endDate) {
    const params = {
        apikey: songkickApiKey,
        query: city,
        per_page: maxResults
    };

    queryString = formatParams(params);
    const url = songkickLocationBase + queryString;

    //call fetch here with url
}

//Format the songkick params into the query string
function formatParams(params) {
    const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

//Call the Spotify Search API to obtain the artist's URI used to generate the player
function getArtistURI(artistName){
    const params = {
        q: artistName
    };

    const options = {
        headers: new Headers({

        })
    };

   const queryString = formatParams(params);
   const url = spotifySearchBase + '?' + queryString;

    //call fetch here with url
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
        getConcerts(city, startDate, endDate);
    });
}