// read and set any environment variables with the dotenv package
require("dotenv").config();
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var request = require('request');
var fs = require('fs');

var keys = require('./keys.js');
var twitterKeys = keys.twitterKeys;

// accept user input when in the command line
var input = process.argv;
var command = input[2];
var argument = '';
for (var i = 3; i < input.length; i++) {
    argument += input[i] + '+';
}
// console.log(command);

// examining user input and deciding which function to run
if (command === "tweets" || command === "my-tweets") {
    tweets();
} else if (command === "music" || command === "spotify-this-song") {
    music();
} else if (command === "movies" || command === "movie-this") {
    movies();
} else if (command === "do-what-it-says") {
    readTxt();
} else {
    console.log("Incorrect User Input");
    return;
}

function tweets() {
    fs.appendFile('./log.txt', 'Command: node liri.js tweets or node liri.js my-tweets\n\nTwitter Feed\n', (error) => {
        if (error) {
            return console.log('Error occured: ' + error);
        }
    });
    var client = new Twitter(keys.twitter);
    var params = {screen_name: 'Cowartbunga', count: 20}; // TESTED this count to work, but I only have 2 tweets right now.
    client.get('statuses/user_timeline', params, function(error, tweets, response) {
        if (error) {
            return console.log('Error occurred: ' + error);
        } else {
            var twitterString;
            var twitterText;
            var twitterDate;
            for (var i = 0; i < tweets.length; i++) {
                twitterText = tweets[i].text;
                twitterDate = new Date(tweets[i].created_at);
                var twitterDateFormat = ((twitterDate.getMonth() + 1) + '/' + twitterDate.getDay() + '/' +  twitterDate.getFullYear() + ' ' +  twitterDate.getHours() + ':' +  twitterDate.getMinutes());
                twitterString = (twitterText + "\n" + twitterDateFormat + "\n");
                fs.appendFile('./log.txt', '\n' + twitterString, (err) => {
    				if (err) throw err;
                });
                console.log(twitterString);
            }
        }
    });
}

function music() {
    fs.appendFile('./log.txt', 'Command: node liri.js music or node liri.js spotify-this-song\n\nMusic Info', (error) => {
        if (error) {
            return console.log('Error occured: ' + error);
        }
    });
    if (argument === '') {
        argument = 'The Sign Ace of Base';
    }
    var search = argument;
    var spotify = new Spotify(keys.spotify);
    spotify.search({ type: 'track', query: search}, function(error, data) {
        if (error) {
            return console.log('Error occurred: ' + error);
        } else {
            var songInfo = data.tracks.items[0];
            var songInfoString = ("Song Artist: " + songInfo.artists[0].name + "\nSong Name: " + songInfo.name + "\nSong Link: " + songInfo.external_urls.spotify + "\nSong Album: " + songInfo.album.name + "\n");
            fs.appendFile('./log.txt', '\n\n' + songInfoString, (err) => {
                if (err) throw err;
            });
            console.log(songInfoString);
        }
    });
}

function movies() {
    fs.appendFile('./log.txt', 'Command: node liri.js movies or node liri.js movie-this\n\nMovie Info', (error) => {
        if (error) {
            return console.log('Error occured: ' + error);
        }
    });
    if (argument === '') {
        argument = 'Mr. Nobody';
    }
    var search = argument;
    var queryStr = 'http://www.omdbapi.com/?t=' + search + '&y=&plot=short&tomatoes=true&apikey=trilogy';
    request(queryStr, function(error, response, body) {
        // If the request is successful (i.e. if the response status code is 200)
        if (!error && response.statusCode === 200) {
            var data = JSON.parse(body);
            var movieDataString = ("Title of the movie: " + data.Title +
                                 "\nYear the movie came out: " + data.Year +
                                 "\nIMDB Rating of the movie: " + data.imdbRating +
                                 "\nRotten Tomatoes Rating of the movie: " + data.Ratings[1].Value +
                                 "\nCountry where the movie was produced: " +  data.Country +
                                 "\nLanguage of the movie: " + data.Language +
                                 "\nPlot of the movie: " + data.Plot +
                                 "\nActors in the movie: " + data.Actors + "\n");
            fs.appendFile('./log.txt', '\n\n' + movieDataString, (err) => {
                if (err) throw err;
            });
            console.log(movieDataString);
        }
    });
}

function readTxt() {
    fs.readFile('random.txt', 'utf8', function(error,data) {
        if (error) {
			console.log(error);
            return;
        } else {
            var randomTxt = data.split(",");
            var randomCmd = randomTxt[0].trim();
            var randomParam = randomTxt[1].trim();
            switch(randomCmd) {
                case 'my-tweets':
                    tweets();
                    break;
                case 'spotify-this-song':
                    music(randomParam);
                    break;
                case 'movie-this':
                    movies(randomParam);
            }
        }
    });
}