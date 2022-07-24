import PropTypes from 'prop-types';
import React from 'react';
import { VegaLite } from 'react-vega';
import { append, curry, of } from 'ramda';

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
 * Returns true if s1 starts with s2. Uses a case insensitive comparison.
 */
const startsWith = curry((s2, s1) => s1.toLowerCase().startsWith(s2));

export default function PairPlot({ data, maxColumns, maxPairs, types }) {
  const columns = Object.keys(types);

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
    transform: [
      { filter: `isValid(datum['${fieldX}'])` },
      { filter: `isValid(datum['${fieldY}'])` },
    ],
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
    transform: [{ filter: `isValid(datum['${nominalField}'])` }],
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
    transform: [{ filter: `isValid(datum['${nominalField}'])` }],
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

  const pairs = combinations(columns, 2).slice(0, maxPairs);

  const spec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: { values: data },
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
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  maxPairs: PropTypes.number,
  types: PropTypes.objectOf(PropTypes.oneOf(types)).isRequired,
};

PairPlot.defaultProps = {
  // colors: {selected: '#1C61A5', unselected: '#FC6910'},
  maxColumns: 2,
  maxPairs: 8,
};
