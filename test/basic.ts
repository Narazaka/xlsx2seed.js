// tslint:disable no-implicit-dependencies

'use strict';

import * as assert from 'power-assert';
import { Xlsx2SeedData } from '../src/lib/xlsx2seed';

describe('Xlsx2SeedData', () => {
  const vars = {
    get sheet_name() { return 'sheet'; },
    get column_names() { return ['id', 'col1', 'col2']; },
    get rows() {
      return [
        [1, 'c1-1', 'c2-1'],
        [2, 'c1-2', 'c2-2'],
        [0, 'no', 'no-2'],
      ];
    },
    get data() { return new Xlsx2SeedData(vars.sheet_name, vars.column_names, vars.rows); },
    get key_based() {
      return {
        data1: {id: 1, col1: 'c1-1', col2: 'c2-1'},
        data2: {id: 2, col1: 'c1-2', col2: 'c2-2'},
      };
    },
  };

  describe('getetrs', () => {
    const subject = () => vars.data;

    it('sheet_name', () => { assert(subject().sheet_name === vars.sheet_name); });
    it('column_names', () => { assert.deepEqual(subject().column_names, vars.column_names); });
    it('rows', () => { assert.deepEqual(subject().rows, vars.rows); });
  });

  describe('as_key_based', () => {
    const subject = () => vars.data.as_key_based();

    it('', () => { assert.deepEqual(subject(), vars.key_based); });
  });
});
