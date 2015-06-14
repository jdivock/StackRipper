'use strict';

var request = require('request'),
    cheerio = require('cheerio'),
    program = require('commander'),
    async = require('async'),
    objectAssign = require('object-assign'),
    debug = require('debug')('StackRip:index.js'),
    fs = require('fs');

request = request.defaults({jar: true});

program
    .version('0.1.0')
    .option('-d, --destination [location]', 'Download destination')
    .option('-w, --episode [episdoeNumber]', 'Stack episode')
    .parse(process.argv);

var STACK_URL = 'http://hypem.com/stack/';
var destination = program.destination || '.';

function getSongURLs($page){
    return JSON.parse($page('#displayList-data').text()).tracks;
}

function getSongDownloadLocations(songs){
    return new Promise(function(resolve, reject){
        async.map(songs,
                  function(song, cb){
                      request.get('http://hypem.com/serve/source/' +  song.id + '/'
                                  + song.key,
                                  function(err, resp, body){
                                      if(err){
                                          debug.err('Error fetching dl location');
                                          cb('Error fetching dl location');
                                      }

                                      //console.log(body);
                                      cb(null, objectAssign(song, JSON.parse(body)));
                                  });
                  },
                  function(err, results){
                      if(err){
                          reject(err);
                      }

                      resolve(results);
                  }
                 );
    });

}


request(STACK_URL + program.episode, function(err, resp, html){
    if(err){
        debug.err('Error fetching url');
        return;
    }

    getSongDownloadLocations(getSongURLs(cheerio.load(html))).then(function(results){
        results.forEach(function(song){
            console.log('downloading ' + song.url);
            request(song.url).pipe(fs.createWriteStream(destination + '/' + song.artist + ' - ' + song.song + '.mp3'));
        });
    });
});
