/* eslint new-cap: 0 */
const Debug = require('debug');
const debug = Debug('StackRip:index.js');
const program = require('commander');

Debug.enable('*');

const stackRip = require('./lib/stackRip');

program.version(require('./package.json').version)
  .option('-d, --destination [location]', 'Download destination')
  .option('-w, --episode [episodeNumber]', 'Stack episode')
  .parse(process.argv);

debug('firing up stackrip');

stackRip(program.episode, program.destination || '.');
