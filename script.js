'use strict';

const songkickApiKey = 'ZtmmBiNtoDue1K6l';
const youtubeApiKey = 'AIzaSyCXmNnQkli4umDw-wWFFsBB2q7KooLVOTY';

const songkickLocationBase = 'https://api.songkick.com/api/3.0/search/locations.json?';
const youtubeSearchBase = 'https://www.googleapis.com/youtube/v3/search';
const googlemapsEmbedBase = 'https://www.google.com/maps/embed/v1/search?';

let currentArtist = '';
let currentVenue = '';
let startDate = '';
let endDate = '';
let maxResults = '';

//Get metro ID using location API
function getMetroID(city) {
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
    .then(responseJson => displayCities(responseJson))
    .catch(error => {
        $('#error').text(`Please Enter a Valid City`);
        $('#cities').hide();
    });
}

function displayCities(responseJson) {
    $('#cities').removeClass('hidden');
    const cityArray = responseJson.resultsPage.results.location;
    for (let i = 0; i < cityArray.length; i++) {
        if (cityArray[i].city.country.displayName === 'US') {
            $('#cities').append(
                `<li>
                    <p class="city-name" tabindex="0">${cityArray[i].city.displayName}, 
                    ${cityArray[i].metroArea.state.displayName}</p>
                    <p class="metroAreaID hidden">${cityArray[i].metroArea.id}</p>
                </li>`);
        } else {
            $('#cities').append(
                `<li>
                    <p class="city-name" tabindex="0">${cityArray[i].city.displayName}, ${cityArray[i].city.country.displayName}</p>
                    <p class="metroAreaID hidden">${cityArray[i].metroArea.id}</p>
                </li>`);
        }
    }
}

//Get list of concerts from Songkick
function getConcerts(metroID) {
    const params = {
        apikey: songkickApiKey,
        min_date: startDate,
        max_date: endDate,
        per_page: maxResults
    };

    const queryString = formatParams(params);
    let url = `https://api.songkick.com/api/3.0/metro_areas/${metroID}/calendar.json?` + queryString;

    fetch(url)
    .then(response => {
        if(response.ok) {
            return response.json();
        } throw new Error(response.statusText);
    })
    .then(responseJson => displayConcerts(responseJson))
    .catch(error => {
        if ($('.datepickerstart').val() == null) {
            $('#error').text(`Please enter a valid start & end date`);
        } else {
        $('#error').text(`Something Went Wrong: No Concerts in this Area`);
        }
    });
}

//Format params into query string
function formatParams(params) {
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
    $('#concert-results').empty();
    $('#concert-results').removeClass('hidden');
    let poweredBySK = `<img src="images/powered-by-songkick-white.png" class="powered-by-sk">`
    $('#concert-results').prepend(poweredBySK);
    const eventArray = responseJson.resultsPage.results.event;
    for (let i = 0; i < eventArray.length; i++) {
        const concertDate = moment(responseJson.resultsPage.results.event[i].start.date)
                            .format('MMMM Do YYYY');
        $('#concert-results').append(
            `<li>
                <p class="artist-name" tabindex="0">
                ${responseJson.resultsPage.results.event[i].performance[0].artist.displayName}</p>
                <p class="concert-date">${concertDate}</p>
                <p class="venue" tabindex="0">${responseJson.resultsPage.results.event[i].venue.displayName}</p>
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

    fetch(url)
    .then(response => {
        if (response.ok) {
            return response.json();
        } throw new Error(response.statusText);
    })
    .then(responseJson => getVideoIDs(responseJson))
    .catch(error => {
        $('#error').text(`Something Went Wrong: ${error.message}`);
    });
}

//Put video ID's into object
function getVideoIDs(responseJson) {
    const videos = [];
    for (let i = 0; i < responseJson.items.length; i++) {
        videos.push(responseJson.items[i].id.videoId);
    }
    const videoString = videos.toString();
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
    displayMap(fullAddress);

 }

function displayMap(fullAddress) {
    const params = {
        key: youtubeApiKey,
        q: fullAddress
    }; 
    
    const mapsQuery = formatParams(params);
    const mapsEmbedUrl = googlemapsEmbedBase + mapsQuery;
    
    let mapEl = 
        `<iframe width="600" height="337.5" frameborder="0" style="border:0"
        src="${mapsEmbedUrl}" allowfullscreen>
        </iframe>`
    $('#map').append(mapEl);
}

function handleSubmit(){
    $('#submit').on('click', event => {
        event.preventDefault();
        const city = $('input[name=location]').val();
        startDate = $('#alt-start-date').val();
        endDate = $('#alt-end-date').val();
        maxResults = $('input[name=max-results]').val();
        if (maxResults < 1) {
            $('#error').text('Please Enter a Positive Number');
            return;
        } else {
            $('#error').empty();
        }
        $('#cities').show();
        $('#concert-results').hide();
        $('#description').hide();
        $('#youtube-player').empty();
        $('#map').empty();
        $('#cities').empty();
        $('h1').addClass('transform');
        getMetroID(city);
    });
}

function handleCityClick(startDate, endDate, maxResults){
    $('#cities').on('click keypress', '.city-name', event => {
        $('#cities').addClass('hidden');
        const metroID = $(event.target).nextAll('.metroAreaID').text();
        getConcerts(metroID);
        $('#concert-results').show();
    });
}

//event listener for user clicking on artist name
function handleArtistClick() {
    $('#concert-results').on('click keypress', '.artist-name', event => {
        event.preventDefault();
        //if statement so youtube player only empties if it's not for the venue's artist
        const artistVenue = $(event.target).nextAll('.venue').text().trim();
        if (artistVenue !== currentVenue) {
            $('#map').empty();
        }
        $('#youtube-player').empty();
        let artistName = $(event.target).text().trim();
        getVideos(artistName);
        currentArtist = artistName;
    });
}

function handleVenueClick() {
    $('#concert-results').on('click keypress', '.venue', event => {
        $('#map').empty();
        let venueName = $(event.target).text();
        let venueID = $(event.target).next().text();
        const venueArtist = $(event.target).prevAll('.artist-name').text().trim();
        if (venueArtist !== currentArtist) {
            $('#youtube-player').empty();
        }
        getConcertAddress(venueID);
        currentVenue = venueName;
    });
}

function handleLogoClick() {
    $('.logo').on('click', event => {
        $('#description').show();
        $('#error').empty();
        $('#concert-results').hide();
        $('#youtube-player').empty();
        $('#map').empty();
        $('#cities').hide();
        $('h1').removeClass('transform');
    });
}

function datePicker() {
    $('.datepickerStart').datepicker(
        {dateFormat: 'mm-dd-yy',
         altField: '#alt-start-date',
         altFormat: 'yy-mm-dd'
    });

    $('.datepickerEnd').datepicker(
        {dateFormat: 'mm-dd-yy',
         altField: '#alt-end-date',
         altFormat: 'yy-mm-dd'
    });
}

function runApp() {
    handleSubmit();
    handleArtistClick();
    handleVenueClick();
    handleCityClick();
    handleLogoClick();
    datePicker();
}

$(runApp);