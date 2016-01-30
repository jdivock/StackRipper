const debug = require('debug')('StackRip:index.js');
const program = require('commander');

const stackRip = require('./lib/stackRip');

program.version(require('./package.json').version)
  .option('-d, --destination [location]', 'Download destination')
  .option('-w, --episode [episdoeNumber]', 'Stack episode')
  .parse(process.argv);

debug('firing up stackrip');

stackRip(program.episode, program.destination || '.');
