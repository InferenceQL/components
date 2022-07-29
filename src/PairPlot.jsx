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
  const color = { default: 'steelblue', selected: 'goldenrod' };

  const truncatedName = (name) => `truncated_${name}`;

  const orders = zipObj(
    nominals,
    nominals.map((nominal) =>
      pipe(map(prop(nominal)), freq, append(truncatedName(nominal)))(data)
    )
  );

  const nominalLimit = 10;

  /* Returns a Vega-Lite calculation that limits */
  const truncateCalculate = curry(
    (n, field) =>
      `indexof(${JSON.stringify(
        orders[field]
      )}, datum['${field}']) < ${n} ? datum['${field}'] : 'All Others'`
  );

  const nominalTransforms = nominals.flatMap((nominalField) => [
    {
      calculate: truncateCalculate(nominalLimit, nominalField),
      as: truncatedName(nominalField),
    },
  ]);

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

  const nominalPlot = (fieldX, fieldY) => {
    const x = {
      title: fieldX,
      field: truncatedName(fieldX),
      order: orders[fieldX],
    };
    const y = {
      title: fieldY,
      field: truncatedName(fieldY),
      order: orders[fieldY],
    };

    return {
      transform: [
        { filter: `isValid(datum['${x.field}'])` },
        { filter: `isValid(datum['${y.field}'])` },
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
              field: x.field,
              title: x.title,
              sort: x.order,
              type: 'nominal',
            },
            y: {
              field: y.field,
              title: y.title,
              sort: y.order,
              type: 'nominal',
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
              field: x.field,
              title: x.title,
              sort: x.order,
              type: 'nominal',
            },
            y: {
              field: y.field,
              title: y.title,
              sort: y.order,
              type: 'nominal',
            },
            size: { aggregate: 'count', legend: null },
            color: { value: color.selected },
          },
        },
      ],
    };
  };

  const barChart = ({ quantField, nominalField }) => ({
    transform: [
      { filter: `isValid(datum['${nominalField}'])` },
      {
        window: [{ op: 'rank', as: 'rank' }],
        sort: [{ field: quantField, order: 'descending' }],
      },
      { filter: `datum.rank <= ${nominalLimit}` },
    ],
    mark: 'bar',
    encoding: {
      x: {
        field: nominalField,
        type: 'nominal',
        title: `${nominalField} (top ${nominalLimit})`,
        sort: {
          field: quantField,
          order: 'descending',
        },
      },
      y: { field: quantField, type: 'quantitative' },
      color: { value: color.default },
    },
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
      x: {
        field: truncatedName(nominalField),
        type: 'nominal',
        title: nominalField,
        sort: orders[nominalField],
      },
      y: { field: quantField, type: 'quantitative', scale: { zero: false } },
      xOffset: { field: 'offset', type: 'quantitative' },
      color: {
        condition: { param: 'selected', empty: false, value: color.selected },
        value: color.default,
      },
    },
  });

  const pairSpec = ([fieldX, fieldY]) => {
    const x = { field: fieldX, type: types[fieldX] };
    const y = { field: fieldY, type: types[fieldY] };

    if (x.type === 'quantitative' && y.type === 'quantitative') {
      return quantitativePlot(x.field, y.field);
    }

    if (x.type === 'nominal' && y.type === 'nominal') {
      return nominalPlot(x.field, y.field);
    }

    const quantField = x.type === 'quantitative' ? x.field : y.field;
    const nominalField = x.type === 'nominal' ? x.field : y.field;

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
      ...nominalTransforms,
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
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  maxPairs: PropTypes.number,
  types: PropTypes.objectOf(PropTypes.oneOf(types)).isRequired,
};

PairPlot.defaultProps = {
  maxPairs: 8,
};
