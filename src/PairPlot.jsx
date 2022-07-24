import PropTypes from 'prop-types';
import React from 'react';
import { VegaLite } from 'react-vega';
import {
  append,
  countBy,
  curry,
  descend,
  map,
  nth,
  of,
  identity,
  pipe,
  prop,
  sort,
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
 * Returns all the unique values in an array sorted by frequency.
 */
const freq = pipe(
  countBy(identity),
  toPairs,
  sort(descend(nth(1))),
  map(nth(0))
);

/*
 * Returns true if s1 starts with s2. Uses a case insensitive comparison.
 */
const startsWith = curry((s2, s1) => s1.toLowerCase().startsWith(s2));

export default function PairPlot({ data, maxPairs, types }) {
  const columns = Object.keys(types);
  const nominals = columns.filter((col) => types[col] === 'nominal');
  const orders = zipObj(
    nominals,
    nominals.map((nominal) => freq(map(prop(nominal), data)))
  );

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

  const truncate = curry(
    (n, field) =>
      `indexof(${JSON.stringify(
        orders[field]
      )}, datum['${field}']) < ${n} ? datum['${field}'] : 'All Others'`
  );

  const nominalPlot = (fieldX, fieldY) => {
    const n = 10;
    const xOrder = [...orders[fieldX], 'calcX'];
    const yOrder = [...orders[fieldY], 'calcY'];

    return {
      transform: [
        { filter: `isValid(datum['${fieldX}'])` },
        { filter: `isValid(datum['${fieldY}'])` },
        { calculate: truncate(n, fieldX), as: 'truncatedX' },
        { calculate: truncate(n, fieldY), as: 'truncatedY' },
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
            x: {
              field: 'truncatedX',
              type: 'nominal',
              title: fieldX,
              sort: xOrder,
            },
            y: {
              field: 'truncatedY',
              type: 'nominal',
              title: fieldY,
              sort: yOrder,
            },
            size: { aggregate: 'count', legend: null },
            color: { value: color.default },
          },
        },
        {
          mark: 'circle',
          transform: [{ filter: { param: 'selected', empty: false } }],
          encoding: {
            x: {
              field: 'truncatedX',
              type: 'nominal',
              title: fieldX,
              sort: xOrder,
            },
            y: {
              field: 'truncatedY',
              type: 'nominal',
              title: fieldY,
              sort: yOrder,
            },
            size: { aggregate: 'count', legend: null },
            color: { value: color.selected },
          },
        },
      ],
    };
  };

  const barChart = ({ quantField, nominalField }) => {
    const n = 10;
    return {
      transform: [
        { filter: `isValid(datum['${nominalField}'])` },
        {
          window: [{ op: 'rank', as: 'rank' }],
          sort: [{ field: quantField, order: 'descending' }],
        },
        { filter: `datum.rank <= ${n}` },
      ],
      mark: 'bar',
      encoding: {
        x: {
          field: nominalField,
          type: 'nominal',
          title: `${nominalField} (top ${n})`,
          sort: {
            field: quantField,
            order: 'descending',
          },
        },
        y: { field: quantField, type: 'quantitative' },
        color: { value: color.default },
      },
    };
  };

  const jitterPlot = ({ nominalField, quantField }) => {
    const n = 5;
    const order = [...orders[nominalField], 'truncated'];

    return {
      mark: 'circle',
      transform: [
        { filter: `isValid(datum['${nominalField}'])` },
        { calculate: truncate(n, nominalField), as: 'truncated' },
      ],
      width: { step: 40 },
      params: [
        {
          name: 'selected',
          select: { type: 'interval', encodings: ['x', 'y'] },
        },
      ],
      encoding: {
        x: {
          field: 'truncated',
          type: 'nominal',
          title: nominalField,
          sort: order,
        },
        y: { field: quantField, type: 'quantitative', scale: { zero: false } },
        xOffset: { field: 'offset', type: 'quantitative' },
        color: {
          condition: { param: 'selected', empty: false, value: color.selected },
          value: color.default,
        },
      },
    };
  };

  const pairSpec = ([fieldX, fieldY]) => {
    const [typeX, typeY] = [types[fieldX], types[fieldY]];

    if (typeX === 'quantitative' && typeY === 'quantitative') {
      return quantitativePlot(fieldX, fieldY);
    }

    if (typeX === 'nominal' && typeY === 'nominal') {
      return nominalPlot(fieldX, fieldY);
    }

    // One quantitative field, one nominal field:

    const quantField = typeX === 'quantitative' ? fieldX : fieldY;
    const nominalField = typeX === 'nominal' ? fieldX : fieldY;

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
    vconcat: pairs.map(pairSpec),
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
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  maxPairs: PropTypes.number,
  types: PropTypes.objectOf(PropTypes.oneOf(types)).isRequired,
};

PairPlot.defaultProps = {
  // colors: {selected: '#1C61A5', unselected: '#FC6910'},
  maxPairs: 8,
};
