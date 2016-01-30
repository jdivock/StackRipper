const debug = require('debug')('StackRip:index.js');
const async = require('async');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const program = require('commander');
const request = require('request').defaults({ jar: true });

program.version('0.1.0')
  .option('-d, --destination [location]', 'Download destination')
  .option('-w, --episode [episdoeNumber]', 'Stack episode')
  .parse(process.argv);

const STACK_URL = 'http://hypem.com/stack/';
const destination = program.destination || '.';

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
