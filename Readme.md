# [xlsx2seed.js](https://github.com/Narazaka/xlsx2seed.js)

[![npm](https://img.shields.io/npm/v/xlsx2seed.svg)](https://www.npmjs.com/package/xlsx2seed)
[![npm license](https://img.shields.io/npm/l/xlsx2seed.svg)](https://www.npmjs.com/package/xlsx2seed)
[![npm download total](https://img.shields.io/npm/dt/xlsx2seed.svg)](https://www.npmjs.com/package/xlsx2seed)
[![npm download by month](https://img.shields.io/npm/dm/xlsx2seed.svg)](https://www.npmjs.com/package/xlsx2seed)

[![Dependency Status](https://david-dm.org/Narazaka/xlsx2seed.js.svg)](https://david-dm.org/Narazaka/xlsx2seed.js)
[![devDependency Status](https://david-dm.org/Narazaka/xlsx2seed.js/dev-status.svg)](https://david-dm.org/Narazaka/xlsx2seed.js?type=dev)
[![Travis Build Status](https://travis-ci.org/Narazaka/xlsx2seed.js.svg?branch=master)](https://travis-ci.org/Narazaka/xlsx2seed.js)
[![AppVeyor Build Status](https://ci.appveyor.com/api/projects/status/github/Narazaka/xlsx2seed.js?branch=master&svg=true)](https://ci.appveyor.com/project/Narazaka/xlsx2seed-js)
[![codecov.io](https://codecov.io/github/Narazaka/xlsx2seed.js/coverage.svg?branch=master)](https://codecov.io/github/Narazaka/xlsx2seed.js?branch=master)
[![Code Climate](https://codeclimate.com/github/Narazaka/xlsx2seed.js/badges/gpa.svg)](https://codeclimate.com/github/Narazaka/xlsx2seed.js)

xlsx to seed yamls

## Install

npm:
```
npm install -g xlsx2seed
```

## Usage

```
$ xlsx2seed

  Usage: xlsx2seed [options] <files...>

  Options:

    -h, --help                                                         output usage information
    -V, --version                                                      output the version number
    -S, --subdivide [sheet_name1:2,1:sheet_name2:2,2:sheet_name3,...]  subdivide rules
    -I, --ignore [sheet_name1,sheet_name2,...]                         ignore sheet names
    -O, --only [sheet_name1,sheet_name2:2,...]                         only sheet names
    -i, --input [path]                                                 input directory
    -o, --output [path]                                                output directory
    -d, --stdout                                                       output one sheets to stdout
    -R, --require-version [version]                                    require version (with version column)
    -v, --version-column [column_name]                                 version column
    -n, --ignore-columns [column_name1,column_name2,...]               ignore columns
    -c, --config [path]                                                config file (default: xlsx2seed.yml)
    -C, --config-content [yaml string]                                 config content

  Examples:

    # multiple files
    $ xlsx2seed -i /path/to/src -o /path/to/dst hoge.xlsx huga.xlsx

    # only foo and bar sheets / bar subdivide postfix 2
    $ xlsx2seed hoge.xlsx huga.xlsx -O foo,bar:2

    # foo subdivide prefix 1 / bar subdivide postfix 2 / baz subdivide prefix 1 and postfix 2
    $ xlsx2seed hoge.xlsx huga.xlsx -S 2:foo,bar:2,1:baz:2

    # column names row is 3 (2 in zero origin)
    $ xlsx2seed hoge.xlsx huga.xlsx -C "column_names_row: 2"
```

## Build

```
git clone ...
cd xlsx2seed
npm i
gulp
npm i .
```

## Changelog

### v1.0.0

#### feature: require version

`-R -v` option.

#### feature: ignore columns

`-n` option.

#### BREAKING CHANGE: default ignored columns

Now there is no ignored columns. (It was "dummy" and "VERSION".)

#### BREAKING CHANGE: Xlsx2SeedSheet::data API

Now Xlsx2SeedSheet::data() is a method. (It was a getter property, Xlsx2SeedSheet::data.)

## License

This is released under [Zlib License](http://narazaka.net/license/Zlib?2018).

This software is using libraries that is released under [Apache 2.0 license](http://www.apache.org/licenses/LICENSE-2.0).
