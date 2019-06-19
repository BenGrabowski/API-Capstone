'use strict';

const songkickApiKey = 'ZtmmBiNtoDue1K6l';
const youtubeApiKey = 'AIzaSyCXmNnQkli4umDw-wWFFsBB2q7KooLVOTY';

const songkickLocationBase = 'https://api.songkick.com/api/3.0/search/locations.json?';
const youtubeSearchBase = 'https://www.googleapis.com/youtube/v3/search';
const googlemapsEmbedBase = 'https://www.google.com/maps/embed/v1/search?';

let currentArtist = '';
let currentVenue = '';

//Get metro ID using location API
function getMetroID(city, startDate, endDate, maxResults) {
    console.log('getMetroID ran');
    const params = {
        apikey: songkickApiKey,
        query: city
    };
    const queryString = formatParams(params);
    const url = songkickLocationBase + queryString;

    fetch(url)
    .then(response => {
        if (response.ok) {
            return response.json();
        } throw new Error(response.statusText)
    })
    .then(responseJson => getConcerts(responseJson.resultsPage.results.location[0].metroArea.id, startDate, endDate, maxResults))
    .catch(error => {
        // $('#error').text(`Something Went Wrong: ${error.message}`);
        $('#error').text(`Please Enter a Valid City`);

    });
}

//Get list of concerts from Songkick
function getConcerts(metroID, startDate, endDate, maxResults) {
    console.log('getConcerts ran');
    console.log(metroID, startDate, endDate);
    const params = {
        apikey: songkickApiKey,
        min_date: startDate,
        max_date: endDate,
        per_page: maxResults
    };

    const queryString = formatParams(params);
    console.log(queryString);
    let url = `https://api.songkick.com/api/3.0/metro_areas/${metroID}/calendar.json?` + queryString;
    console.log(url);

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

//Format params into query string
function formatParams(params) {
    console.log('formatParams ran');
    const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

function getConcertAddress(venueID) {
    const params = {
        apikey: songkickApiKey,
        venue_id: venueID
    };

    const queryString = formatParams(params);
    const url = `https://api.songkick.com/api/3.0/venues/${venueID}.json?apikey=${songkickApiKey}`;

    fetch(url)
    .then(response => {
        if (response.ok) {
            return response.json();
        } throw new Error (response.statusText)
    })
    .then(responseJson => formatAddress(responseJson))
    .catch(error => {
        $('#error').text(`Something Went Wrong: ${error.message}`);
    });
}

function displayConcerts(responseJson) {
    console.log('displayConcerts ran');
    $('#concert-results').empty();
    $('#concert-results').removeClass('hidden');
    // let poweredBySK = `<img src="images/powered-by-songkick-black.png" class="powered-by-sk">`
    // $('#concert-results').prepend(poweredBySK);
    const eventArray = responseJson.resultsPage.results.event;
    for (let i = 0; i < eventArray.length; i++) {
        const concertDate = moment(responseJson.resultsPage.results.event[i].start.date)
                            .format('MMMM Do YYYY');
        //create <li> for each concert here
        $('#concert-results').append(
            `<li>
                <p class="artist-name" target="_blank">
                ${responseJson.resultsPage.results.event[i].performance[0].artist.displayName}</p>
                <p class="concert-date">${concertDate}</p>
                <p class="venue">${responseJson.resultsPage.results.event[i].venue.displayName}</p>
                <p class="venue-id">${responseJson.resultsPage.results.event[i].venue.id}</p>
                <a href="${responseJson.resultsPage.results.event[i].uri}" class="songkick-link" target="_blank">
                SongKick Event
                </a>
            </li>`
        );
    };
}

//Call the YouTube API to get video ID's
function getVideos(artistName) {
    console.log('getVideos ran');
    const params = {
        key: youtubeApiKey,
        q: artistName,
        type: 'video',
        order: 'relevance',
        maxResults: '10',
        part: 'snippet'
    };

    const queryString = formatParams(params);
    let url = youtubeSearchBase + '?' + queryString;
    console.log(url);

    fetch(url)
    .then(response => {
        if (response.ok) {
            return response.json();
        } throw new Error(response.statusText);
    })
    // .then(responseJson => console.log(responseJson))
    .then(responseJson => getVideoIDs(responseJson))
    .catch(error => {
        $('#error').text(`Something Went Wrong: ${error.message}`);
    });
}

//Put video ID's into object
function getVideoIDs(responseJson) {
    console.log('getvideos ran');
    const videos = [];
    for (let i = 0; i < responseJson.items.length; i++) {
        videos.push(responseJson.items[i].id.videoId);
    }
    console.log(videos);
    const videoString = videos.toString();
    console.log(videoString);
    generatePlaylist(videoString);
}

//Generate YouTube video playlist
function generatePlaylist(videoString){
    const playlist = `<iframe width="600" height="337.5" 
        src="https://www.youtube.com/embed/VIDEO_ID?playlist=${videoString}" frameborder="0" allowfullscreen>`;
    
    $('#youtube-player').append(playlist);
}

function formatAddress(responseJson) {
    const streetAddress = responseJson.resultsPage.results.venue.street;
    const venueCity = responseJson.resultsPage.results.venue.city.displayName;
    const venueState = responseJson.resultsPage.results.venue.city.state.displayName;
    const venueZip = responseJson.resultsPage.results.venue.zip;

    const fullAddress = streetAddress + " " + venueCity + ',' + " " + venueState + " " + venueZip;
    console.log(fullAddress);
    displayMap(fullAddress);

 }

function displayMap(fullAddress) {
    const params = {
        key: youtubeApiKey,
        q: fullAddress
    }; 
    
    const mapsQuery = formatParams(params);
    const mapsEmbedUrl = googlemapsEmbedBase + mapsQuery;
    console.log(mapsEmbedUrl);
    
    let mapEl = 
        `<iframe width="600" height="450" frameborder="0" style="border:0"
        src="${mapsEmbedUrl}" allowfullscreen>
        </iframe>`
    $('#map').append(mapEl);
}

function handleSubmit(){
    $('#submit').on('click', event => {
        event.preventDefault();
        const city = $('input[name=location]').val();
        const startDate = $('input[name=start-date]').val();
        const endDate = $('input[name=end-date]').val();
        const maxResults = $('input[name=max-results]').val();
        if (maxResults < 1) {
            $('#error').text('Please Enter a Positive Number');
            return;
        } else {
            $('#error').empty();
        }
        $('#youtube-player').empty();
        $('#map').empty();
        getMetroID(city, startDate, endDate, maxResults);
    });
}

//event listener for user clicking on artist name
function handleArtistClick() {
    $('#concert-results').on('click', '.artist-name', event => {
        event.preventDefault();
        //if statement so youtube player only empties if it's not for the venue's artist
        const artistVenue = $(event.target).nextAll('.venue').text().trim();
        if (artistVenue !== currentVenue) {
            $('#map').empty();
        }
        $('#youtube-player').empty();
        let artistName = $(event.target).text().trim();
        console.log(artistName);
        getVideos(artistName);
        currentArtist = artistName;
    });
}

function handleVenueClick() {
    $('#concert-results').on('click', '.venue', event => {
        $('#map').empty();
        let venueName = $(event.target).text();
        let venueID = $(event.target).next().text();
        console.log(venueName);
        console.log(venueID);
        const venueArtist = $(event.target).prevAll('.artist-name').text().trim();
        console.log(venueArtist);
        if (venueArtist !== currentArtist) {
            $('#youtube-player').empty();
        }
        getConcertAddress(venueID);
        currentVenue = venueName;
    });
}

function datePicker() {
        $('.datepicker').datepicker({dateFormat: 'yy-mm-dd'});
}

function runApp() {
    handleSubmit();
    handleArtistClick();
    handleVenueClick();
    datePicker();
}

$(runApp);