var express = require('express');
var app = express();
var hb = require('express-handlebars');
app.engine('handlebars', hb());
app.set('view engine', 'handlebars');
var https = require('https');

console.log("listening");

var key = 'wMqcNRyXkx64PbKr4qX1XgcTY';
var secret = 'MXnwBfWPP9ZygVg144SCp4pKrUPKg4M9Dvn4QONm9PsYGx64df';
var keysecret = key + ':' + secret;
var base = new Buffer(keysecret).toString('base64');

var tokenOptions = {
    method: 'POST',
    host: 'api.twitter.com',
    path: '/oauth2/token',
    headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        "Authorization": 'Basic ' + base
    }
};



app.get('/', function(req, res) {
    var count = 0;
    var str = '';
    var callback = function(response) {
        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            str = JSON.parse(str);
            var token = str["access_token"];
            var requestOnion = {
                method: 'GET',
                host: 'api.twitter.com',
                path: '/1.1/statuses/user_timeline.json?count=10&screen_name=TheOnion',
                headers: {
                    Authorization: 'Bearer ' + token
                }
            };
            var requestNewScientist = {
                method: 'GET',
                host: 'api.twitter.com',
                path: '/1.1/statuses/user_timeline.json?count=10&screen_name=newscientist',
                headers: {
                    Authorization: 'Bearer ' + token
                }
            };
            var requestNewYorker = {
                method: 'GET',
                host: 'api.twitter.com',
                path: '/1.1/statuses/user_timeline.json?count=10&screen_name=NewYorker',
                headers: {
                    Authorization: 'Bearer ' + token
                }
            };
            var display = [];
            var urls = [];
            var source = [];
            var created = [];
            callback = function(response){
                var tweets = '';
                response.on('data', function(chunk){
                    tweets += chunk;
                });
                response.on('end', function (){
                    tweets = JSON.parse(tweets);
                    var reg = /^(.*?)http/;
                    tweets.forEach(function(tweet){
                        var regResult = reg.exec(tweet.text);
                        if (regResult != null && regResult[1].substring(0,2) != 'RT' && tweet.entities.urls[0] != undefined) {
                            display.push(regResult[1]);
                            urls.push(tweet.entities.urls[0].url);
                            source.push(tweet.user.name);
                            created.push(tweet.created_at.split(' ')[3].split(':').join(''));
                        }
                    });
                    count += 1;
                    if (count == 3){
                        var displayArr = [];
                        for (var i = 0; i < display.length; i++){
                            displayArr.push({todisplay: display[i], thelink: urls[i], source: source[i], created: created[i]});
                        }
                        var sortedArray = displayArr.slice(0);
                        sortedArray.sort(function(a,b) {
                            return a.created - b.created;
                        });
                        var obj = {toiterate: sortedArray};
                        res.render('slider', {
                            layout: 'layout',
                            css: 'Ticker.css',
                            id: 'whatever',
                            iterate: obj.toiterate
                        });
                    }
                });
            };
            var onion = https.request(requestOnion, callback);
            var newScientest = https.request(requestNewScientist, callback);
            var newYorker = https.request(requestNewYorker, callback);
            onion.end();
            newScientest.end();
            newYorker.end();
        });
    };
    var request = https.request(tokenOptions, callback);
    request.write("grant_type=client_credentials");
    request.end();
});


app.use(express.static(__dirname + '/'));

app.listen(8080);
