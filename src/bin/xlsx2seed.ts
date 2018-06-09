#!/usr/bin/env node

// tslint:disable no-console

'use strict';

import * as commander from 'commander';
import * as fs from 'fs';
import * as jsyaml from 'js-yaml';
import * as path from 'path';
import { KeyBasedRecord, Xlsx2Seed, Xlsx2SeedSheetConfig } from '../lib/xlsx2seed';

const default_config_file = 'xlsx2seed.yml';

type Program = import ('commander').Command & {
  subdivide: string[];
  ignore: string[];
  only: string[];
  input: string;
  output: string;
  stdout: boolean;
  requireVersion: string;
  versionColumn: string;
  ignoreColumns: string[];
  config: string;
  configContent: string;
};

const program = commander
  .version(require('../package.json').version) // tslint:disable-line no-var-requires no-require-imports
  .arguments('<files...>')
  // tslint:disable-next-line max-line-length
  .option('-S, --subdivide [sheet_name1:2,1:sheet_name2:2,2:sheet_name3,...]', 'subdivide rules', (value) => value.split(','), [])
  .option('-I, --ignore [sheet_name1,sheet_name2,...]', 'ignore sheet names', (value) => value.split(','), [])
  .option('-O, --only [sheet_name1,sheet_name2:2,...]', 'only sheet names', (value) => value.split(','), [])
  .option('-i, --input [path]', 'input directory', String, '.')
  .option('-o, --output [path]', 'output directory', String, '.')
  .option('-d, --stdout', 'output one sheets to stdout')
  .option('-R, --require-version [version]', 'require version (with version column)', String, '')
  .option('-v, --version-column [column_name]', 'version column', String, '')
  .option('-n, --ignore-columns [column_name1,column_name2,...]', 'ignore columns', (value) => value.split(','), [])
  .option('-c, --config [path]', 'config file (default: xlsx2seed.yml)', String, '')
  .option('-C, --config-content [yaml string]', 'config content', String, '')
  .on('--help', () => {
    console.log('  Examples:');
    console.log('');
    console.log('    # multiple files');
    console.log('    $ xlsx2seed -i /path/to/src -o /path/to/dst hoge.xlsx huga.xlsx');
    console.log('');
    console.log('    # only foo and bar sheets / bar subdivide postfix 2');
    console.log('    $ xlsx2seed hoge.xlsx huga.xlsx -O foo,bar:2');
    console.log('');
    console.log('    # foo subdivide prefix 1 / bar subdivide postfix 2 / baz subdivide prefix 1 and postfix 2');
    console.log('    $ xlsx2seed hoge.xlsx huga.xlsx -S 2:foo,bar:2,1:baz:2');
    console.log('');
    console.log('    # column names row is 3 (2 in zero origin)');
    console.log('    $ xlsx2seed hoge.xlsx huga.xlsx -C "column_names_row: 2"');
    console.log('');
  })
  .parse(process.argv) as Program;

const files = program.args;
if (!files.length) program.help();

function get_config(program: Program) { // tslint:disable-line no-shadowed-variable
  try {
    if (program.configContent) {
      return jsyaml.load(program.configContent) as Xlsx2SeedSheetConfig;
    } else {
      if (program.config) {
        return jsyaml.load(fs.readFileSync(program.config, {encoding: 'utf8'})) as Xlsx2SeedSheetConfig;
      } else if (fs.existsSync(default_config_file)) {
        return jsyaml.load(fs.readFileSync(default_config_file, {encoding: 'utf8'})) as Xlsx2SeedSheetConfig;
      } else {
        return {};
      }
    }
  } catch (error) {
    console.error('load config failed!');
    console.error(error.toString());
    process.exit(1);
    throw error;
  }
}
const config = get_config(program);
if (program.versionColumn) config.version_column = program.versionColumn;
if (program.ignoreColumns) config.ignore_columns = program.ignoreColumns;

interface SubdivideRule {
  cut_prefix: number | false;
  cut_postfix: number | false;
  sheet_name: string;
}

function sheet_name_subdivide_rule(sheet_name: string): SubdivideRule {
  const result = sheet_name.match(/^(?:(\d+):)?(.+?)(?::(\d+))?$/);
  if (!result) throw new Error(`[${sheet_name}] is wrong sheet name and subdivide rule definition`);

  return {
    cut_prefix: result[1] ? Number(result[1]) : false,
    cut_postfix: result[3] ? Number(result[3]) : false,
    sheet_name: result[2],
  };
}

const ignore_sheets: {[name: string]: boolean} = {};
for (const sheet of program.ignore.map(sheet_name_subdivide_rule)) {
  ignore_sheets[sheet.sheet_name] = true;
}

const subdivide_rules: {[name: string]: SubdivideRule} = {};

const only_sheets: {[name: string]: boolean} | undefined = program.only.length ? {} : undefined;
for (const sheet of program.only.map(sheet_name_subdivide_rule)) {
  only_sheets![sheet.sheet_name] = true; // tslint:disable-line no-non-null-assertion
  subdivide_rules[sheet.sheet_name] = sheet;
}

for (const sheet of program.subdivide.map(sheet_name_subdivide_rule)) {
  subdivide_rules[sheet.sheet_name] = sheet;
}

const _console = {
  log: function log(...args: any[]) {
    if (!program.stdout) console.log(...args);
  },
  time: function log(...args: any[]) {
    if (!program.stdout) console.time(...args);
  },
  timeEnd: function log(...args: any[]) {
    if (!program.stdout) console.timeEnd(...args);
  },
};

_console.log(`output-directory: ${program.output}`);
_console.time('total');
for (const file of files) {
  const file_path = path.isAbsolute(file) ? file : path.join(program.input, file);
  _console.log(`${file}:`);
  _console.log(`  full-path: ${file_path}`);
  _console.time('  parsetime');
  const xlsx2seed = new Xlsx2Seed(file_path);
  _console.timeEnd('  parsetime');

  _console.log('  sheets:');
  for (const sheet_name of xlsx2seed.sheet_names) {
    if (only_sheets && !only_sheets[sheet_name]) continue;
    _console.log(`    ${sheet_name}:`);
    if (ignore_sheets[sheet_name]) {
      _console.log('      ignore: skip');
      continue;
    }
    const sheet = xlsx2seed.sheet(sheet_name, config);
    if (!sheet.has_id_column()) {
      _console.log('      warning: id column not found -> skip!');
      continue;
    }
    const {cut_prefix, cut_postfix} = subdivide_rules[sheet_name] || {cut_prefix: false, cut_postfix: false};
    if (cut_prefix !== false || cut_postfix !== false)
      _console.log(`      subdivide: {cut_prefix: ${Number(cut_prefix)}, cut_postfix: ${Number(cut_postfix)}}`);
    _console.time('      writetime');
    const data = sheet.data(program.requireVersion);
    if (program.stdout) {
      const output_data: {[name: string]: KeyBasedRecord} = {};
      output_data[sheet_name] = data.as_key_based();
      console.log(jsyaml.dump(output_data));
    } else {
      data.write_as_single_or_separated_yaml_sync(program.output, cut_prefix, cut_postfix);
    }
    _console.timeEnd('      writetime');
  }
}
_console.timeEnd('total');
