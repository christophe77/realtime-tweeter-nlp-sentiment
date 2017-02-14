var Twitter = require('twitter');
var twitter = new Twitter({
    consumer_key: 'NJb7EqdjW0PDRfpvqVg6UhFP',
    consumer_secret: '645aCeoSiW7loj7jsJd75E5AJk0lkRPOYWCmGNYAC1NvSMLcK',
    access_token_key: '828194018253217793-Zc8rSpEfukVKn7zEkQudYs56SyABf1',
    access_token_secret: 'ieTFpARecDrFAj5s5FuraAmwbh17Mu7xXsoiZc3glYXB'
});

var keywordTowatch = "keyword";
var accountsToSkip = [
	"keyword", 
	"keywordOfficial"
];

var express = require('express')
var app = express();
var http = require('http');

var server = http.createServer(express);

app.use('/', express.static(__dirname + '/static/'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/static/index.html');
});    
var server = http.createServer(app);
var io = require('socket.io').listen(server);
server.listen(8181);

io.on('connection', function (socket) {
	tweetInit(socket.id); 
});

function tweetInit(socketId){
	twitter.get('search/tweets', {q: keywordTowatch}, function(error, tweets, response) {
		if (tweets) {
			for (var i = 0; i < tweets.statuses.length; i++) {	
				if (tweets.statuses[i]){
					tweetAnalyze(tweets.statuses[i], socketId);
				}				
			}
		}
	});
};

twitter.stream('statuses/filter', { track: keywordTowatch },
    function(stream) {
        stream.on('data', function( tweet ) {
			tweetAnalyze(tweet);
        }); 
        stream.on('error', function ( error ) {
            console.error(error);
        }); 
    }
);
function tweetAnalyze(tweet, socketId){
	if(!accountsToSkip(tweet.user.screen_name) && !tweet.hasOwnProperty('retweeted_status')){		
		var tweet_link = 'https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str;
		var userPicture = tweet.user.profile_image_url_https;
		if(tweet.lang == "fr"){
			var dict = require('./AFINN/AFINN-111-FR.json');
			var negate = new RegExp(/^(non|pas|ni|sauf)$/);
		}
		else if (tweet.lang == "en"){
			var dict = require('./AFINN/AFINN-165-EN.json');			
			var negate = new RegExp(/^(not|don't|dont|no|nope|except)$/);
		}
		else if (tweet.lang == "de"){
			var dict = require('./AFINN/AFINN-111-DE.json');
			var negate = new RegExp(/^(nicht|kein|nein)$/);
		}			
		if(dict && negate){			
			var sentimentScore = getAfinnScore(dict, negate, tweet.text);
			var tweetObject = {
				link: tweet_link,
				piclink: userPicture,
				user: tweet.user.screen_name,
				text: tweet.text,
				sentiment: sentimentScore,
				color: colorify(sentimentScore)
			}			
			if(socketId){
				io.to(socketId).emit('tweet', tweetObject);
			}
			else{
				io.sockets.volatile.emit('tweet', tweetObject);
			}		
		}			
	}	
};
function merge(obj1,obj2){
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
}
function isInAfOfficialAccounts(account) {
    return afOfficialAccounts.indexOf(account) > -1;
};
function colorify(sentimentScore) {
	if (sentimentScore <= -4)
		return "danger";
	else if (sentimentScore >= -3 && sentimentScore <= -1)
		return "warning";
	else if (sentimentScore == 0)
		return "info";
	else if (sentimentScore >= 1)
		return "success";
};
var cleanTweetText = function (tweetText) {
    return tweetText.replace(/[-'`~!@#$%^&*()_|+=?;:'",.<>\{\}\[\]\\\/]/gi, '');
};
function getAfinnScore(dict, negate, tweetText) {
    return tweetText.toLowerCase().split(' ').map(cleanTweetText).reduce(function (acc, word) {		
		var score = negate.test(acc.prev) ? -dict[word] : dict[word];
		return {
			sum: acc.sum + (score || 0),
			prev: word
		};
    }, { sum: 0, prev: '' }).sum;
};