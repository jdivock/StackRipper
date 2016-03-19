# StackRipper [![Build Status](https://travis-ci.org/jdivock/StackRipper.svg?branch=master)](https://travis-ci.org/jdivock/StackRipper)

I could run network inspector every week and download stuff from
soundcloud by hand. Or I could just write this script.

## Install
```sh
> npm i -g stackrip
```

## Usage

```sh
> stackrip -w <episodeNumber> -d <dirDest>
```

## Options

* -h(help): usage
* -V(version): version
* -d(destination): download destination
* -w(episode): Episode # to download

## TODO

- Add id3 tags
- Make async stuff less painful, maybe pull in Jafar's stuff
- Patch cases where it dies on certain urls/providers
- Make more resilient, right now if one song dies the whole thing dies
