import PropTypes from 'prop-types';
import { curry, evolve, has, repeat, zipObj } from 'ramda';
import React from 'react';
import { VegaLite } from 'react-vega';
import topojson from './assets/countries-110m.json';

const rename = curry((obj, x) => (has(x, obj) ? obj[x] : x));

const includes = curry((s2, s1) => s1.toLowerCase().includes(s2.toLowerCase()));

export default function WorldMap({ data, types }) {
  const columns = Object.keys(types);
  const numericalField =
    types[columns[0]] === 'quantitative' ? columns[0] : columns[1];

  const renames = {
    'China (PR)': 'China',
    USA: 'United States of America',
  };

  const countryCols = columns.filter(includes('country'));
  const renamedData = data.map(
    evolve(zipObj(countryCols, repeat(rename(renames), countryCols.length)))
  );

  const spec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 600,
    height: 600,
    data: {
      name: 'topojson',
      values: topojson,
      format: {
        type: 'topojson',
        feature: 'countries',
      },
    },
    projection: {
      type: 'mercator',
    },
    layer: [
      {
        transform: [
          {
            lookup: 'properties.name',
            from: {
              data: { values: renamedData },
              key: 'Country_of_Operator',
            },
            as: 'satellite',
          },
        ],
        mark: {
          type: 'geoshape',
          stroke: null,
        },
        encoding: {
          color: {
            field: `satellite.${numericalField}`,
            title: numericalField,
            type: 'quantitative',
          },
        },
      },
      {
        mark: {
          type: 'geoshape',
          stroke: 'black',
          strokeWidth: 0.5,
          opacity: 1,
          fillOpacity: 0,
        },
        encoding: {
          tooltip: { field: 'properties', type: 'nominal' },
        },
      },
    ],
  };

  // const onNewView = (view) => {
  //   console.log(
  //     view
  //   );
  // };

  return <VegaLite actions={false} spec={spec} /* onNewView={onNewView} */ />;
}

const types = ['quantitative', 'temporal', 'ordinal', 'nominal', 'geojson'];

WorldMap.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  types: PropTypes.objectOf(PropTypes.oneOf(types)).isRequired,
};

WorldMap.defaultProps = {};
