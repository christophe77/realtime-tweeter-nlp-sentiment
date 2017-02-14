# realtime-tweeter-nlp-sentiment
Using tweeter streaming API to get realtime tweets containing a given keyword.
The language is detected using tweeter api and analysed using AFINN-165 and AFINN-111 sentiment score in english, german and french.

# Installation :

	npm install

- Edit server.js and put your tweeter api informations
- Put the keyword you want to watch (var keywordTowatch = )
- Add or remove the twitter accounts that you don't want to be skipped (var accountsToSkip=)
- Edit static/index.html and put the right url for socket.io (<script src="http://localhost:8181/socket.io/socket.io.js"></script>)


then run :

    node server.js
    
Navigate to yourwebsite.com:8181
You'll get realtime tweets containing the keyword you want to track and the AFINN score.

# Online Demo using "airfrance" keyword :
https://cbdev.fr/realtime-tweet-sentiment/
	
# TODO :
Add emoji sentiment support : https://github.com/wooorm/emoji-emotion

# Credits :
ml-sentiment : https://github.com/syzer/sentiment-analyser
