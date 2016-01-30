const debug = require('debug')('StackRip:lib/stackRip.js');
const async = require('async');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const request = require('request').defaults({ jar: true });

const STACK_URL = 'http://hypem.com/stack/';

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

module.exports = function stackRip(episode, destination) {
  request(
      `${STACK_URL}${episode}`,
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
      }
  );
};
