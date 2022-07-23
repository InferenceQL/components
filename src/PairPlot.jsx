import PropTypes from 'prop-types';
import React from 'react';
import { VegaLite } from 'react-vega';
import {
  append,
  countBy,
  curry,
  descend,
  evolve,
  identity,
  includes,
  map,
  nth,
  of,
  pipe,
  prop,
  sort,
  take,
  toPairs,
  zipObj,
} from 'ramda';

/*
 * Returns all the combinations of an array of a given length.
 */
function combinations(arr, n) {
  if (n <= 0) return [];
  if (n === 1) return arr.map(of);
  if (arr.length === 0) return [];

  return combinations(arr.slice(1), n - 1)
    .map(append(arr[0]))
    .concat(combinations(arr.slice(1), n));
}

/*
 * Returns the top n most frequent values in an array.
 */
const top = curry((n, arr) =>
  pipe(
    countBy(identity),
    toPairs,
    sort(descend(nth(1))),
    take(n),
    map(nth(0))
  )(arr)
);

/*
 * Returns a function that returns x if x is in arr, otherwise y.
 */
const truncate = curry((arr, replacement, x) =>
  includes(x, arr) ? x : replacement
);

const truncateNominals = curry((n, props, arr) => {
  const transformations = zipObj(
    props,
    map((field) => truncate(top(n, map(prop(field), arr)), 'Others'), props)
  );
  return map(evolve(transformations), arr);
});

/*
 * Returns true if s1 starts with s2. Uses a case insensitive comparison.
 */
const startsWith = curry((s2, s1) => s1.toLowerCase().startsWith(s2));

export default function PairPlot({
  data,
  maxColumns,
  maxNominals,
  maxPairs,
  types,
}) {
  const columns = Object.keys(types);
  const nominals = columns.filter((col) => types[col] === 'nominal');

  const color = { default: 'steelblue', selected: 'goldenrod' };

  const quantitativePlot = (fieldA, fieldB) => {
    const isProbability = startsWith('prob');
    const isCount = startsWith('count');
    const [fieldX, fieldY] =
      isProbability(fieldA) || isCount(fieldA)
        ? [fieldB, fieldA]
        : [fieldA, fieldB];

    return {
      mark: 'circle',
      params: [
        {
          name: 'selected',
          select: { type: 'interval', encodings: ['x', 'y'] },
        },
      ],
      encoding: {
        x: { field: fieldX, type: 'quantitative', scale: { zero: false } },
        y: { field: fieldY, type: 'quantitative', scale: { zero: false } },
        color: {
          condition: { param: 'selected', empty: false, value: color.selected },
          value: color.default,
          opacity: 0.1,
        },
      },
    };
  };

  const nominalPlot = (fieldX, fieldY) => ({
    layer: [
      {
        mark: 'circle',
        params: [
          {
            name: 'selected',
            select: {
              type: 'point',
              nearest: true,
              encodings: ['x', 'y'],
            },
          },
        ],
        encoding: {
          x: { field: fieldX, type: 'nominal' },
          y: { field: fieldY, type: 'nominal' },
          size: { aggregate: 'count', legend: null },
          color: { value: color.default },
        },
      },
      {
        mark: 'circle',
        transform: [{ filter: { param: 'selected', empty: false } }],
        encoding: {
          x: { field: fieldX, type: 'nominal' },
          y: { field: fieldY, type: 'nominal' },
          size: { aggregate: 'count', legend: null },
          color: { value: color.selected },
        },
      },
    ],
  });

  const barChart = ({ quantField, nominalField }) => ({
    layer: [
      {
        mark: 'bar',
        params: [
          {
            name: 'selected',
            select: { type: 'point', encodings: ['x'] },
          },
        ],
        encoding: {
          x: { field: nominalField, type: 'nominal', sort: quantField },
          y: { field: quantField, type: 'quantitative', aggregate: 'sum' },
          color: { value: color.default },
        },
      },
      {
        mark: 'bar',
        transform: [{ filter: { param: 'selected' } }],
        encoding: {
          x: { field: nominalField, type: 'nominal', sort: quantField },
          y: { field: quantField, type: 'quantitative', aggregate: 'sum' },
        },
      },
    ],
  });

  const jitterPlot = ({ nominalField, quantField }) => ({
    mark: 'circle',
    width: { step: 40 },
    params: [
      {
        name: 'selected',
        select: { type: 'interval', encodings: ['x', 'y'] },
      },
    ],
    encoding: {
      x: { field: nominalField, type: 'nominal' },
      y: { field: quantField, type: 'quantitative', scale: { zero: false } },
      xOffset: { field: 'offset', type: 'quantitative' },
      color: {
        condition: { param: 'selected', empty: false, value: color.selected },
        value: color.default,
      },
    },
  });

  const pairSpec = ([fieldX, fieldY]) => {
    const [typeX, typeY] = [types[fieldX], types[fieldY]];

    if (typeX === 'quantitative' && typeY === 'quantitative') {
      return quantitativePlot(fieldX, fieldY);
    }

    if (typeX === 'nominal' && typeY === 'nominal') {
      return nominalPlot(fieldX, fieldY);
    }

    // One quantitative field, one nominal field:

    const [quantField, nominalField] =
      typeX === 'quantitative' ? [fieldX, fieldY] : [fieldY, fieldX];

    if (startsWith('count', quantField)) {
      return barChart({ quantField, nominalField });
    }

    return jitterPlot({ quantField, nominalField });
  };

  const truncatedData = truncateNominals(maxNominals, nominals, data);

  const pairs = combinations(columns, 2).slice(0, maxPairs);

  const spec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: { values: truncatedData },
    transform: [
      { calculate: 'clamp(sampleNormal(0.5, 0.25), 0, 1)', as: 'offset' },
    ],
    concat: pairs.map(pairSpec),
    columns: maxColumns,
    config: {
      scale: {
        bandWithNestedOffsetPaddingInner: 0.6,
      },
    },
  };

  return <VegaLite actions={false} spec={spec} />;
}

const types = ['quantitative', 'temporal', 'ordinal', 'nominal', 'geojson'];

PairPlot.propTypes = {
  // colors: PropTypes.arrayOf(PropTypes.string),
  maxColumns: PropTypes.number,
  maxNominals: PropTypes.number,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  maxPairs: PropTypes.number,
  types: PropTypes.objectOf(PropTypes.oneOf(types)).isRequired,
};

PairPlot.defaultProps = {
  // colors: {selected: '#1C61A5', unselected: '#FC6910'},
  maxColumns: 2,
  maxNominals: 8,
  maxPairs: 8,
};
