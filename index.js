'use strict';

let Debug = require('debug');
let async = require('async');
let cheerio = require('cheerio');
let fs = require('fs');
let path = require('path');
let program = require('commander');
let request = require('request');

Debug.enable('*');

let debug = Debug('StackRip:index.js');

request = request.defaults({jar: true});

program.version('0.1.0')
  .option('-d, --destination [location]', 'Download destination')
  .option('-w, --episode [episdoeNumber]', 'Stack episode')
  .parse(process.argv);

let STACK_URL = 'http://hypem.com/stack/';
let destination = program.destination || '.';

function getSongURLs($page) {
  return JSON.parse($page('#displayList-data').text()).tracks;
}

function getSongDownloadLocations(songs) {
  return new Promise((resolve, reject) => {
    async.map(
        songs,
        (song, cb) => {
          request.get(
              `http://hypem.com/serve/source/${song.id}/${song.key}`,
              (err, resp, body) => {
                if (err) {
                  debug.err('Error fetching dl location');
                  cb('Error fetching dl location');
                }

                cb(null, Object.assign(song, JSON.parse(body)));
              });
        },
        (err, results) => {
          if (err) {
            reject(err);
          }

          resolve(results);
        }
    );
  });
}

request(
    `${STACK_URL}${program.episode}`,
    (err, resp, html) => {
      if (err) {
        debug.err('Error fetching url');
        return;
      }

      getSongDownloadLocations(getSongURLs(cheerio.load(html)))
        .then(results => {
          results.forEach(song => {
            debug(`downloading ${song.url}`);

            request(song.url)
              .pipe(
                fs.createWriteStream(
                  path.join(
                    destination,
                    `${song.artist}-${song.song}.mp3`
                  )
                )
              );
          });
        });
    });
