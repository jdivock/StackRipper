#!/bin/sh

# Just a quick super rough integration test where I just try to run
# the script and assert that some mp3s got downloaded

mkdir -p ./test/fixtures
rm -rf ./test/fixtures/*mp3

if node index.js -w 68 -d ./test/fixtures/
then
  echo "Woot ripper completed"
else
  echo "Womp ripper failed"
  exit -1
fi

number_of_mp3s=`ls ./test/fixtures | wc -l`

if [ $number_of_mp3s -eq 6 ]
then
  echo "Woot all files downloaded"
else
  echo "Womp some files didn't complete"
  exit -1
fi
