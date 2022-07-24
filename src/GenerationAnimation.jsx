import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Box, InputWrapper, Slider } from '@mantine/core';
import { VegaLite } from 'react-vega';
import HighlightInput from './HighlightInput';

function GenerateQuery({ columns, given, limit, model }) {
  const format = (x) => (typeof x === 'string' ? `"${x}"` : x.toString());

  const givenString = Object.entries(given)
    .map(([column, value]) => `${column} = ${format(value)}`)
    .join(' AND ');

  const query = `SELECT * FROM
  GENERATE ${columns.join(', ')}
  UNDER ${model}
  GIVEN ${givenString}
LIMIT ${limit}`;

  return <HighlightInput disabled value={query} />;
}

GenerateQuery.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.string).isRequired,
  given: PropTypes.object.isRequired,
  limit: PropTypes.number.isRequired,
  model: PropTypes.string,
};

GenerateQuery.defaultProps = {
  model: 'baseline_model',
};

function AggregateBarChart({ columns, rows, maxShown }) {
  const spec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    mark: 'bar',
    data: { name: 'table' },
    transform: [
      {
        calculate: columns
          .map((column) => `datum.${column}`)
          .join(" + ', ' + "),
        as: 'group',
      },
      {
        aggregate: [{ op: 'count', field: 'group', as: 'count' }],
        groupby: ['group'],
      },
      {
        window: [{ op: 'row_number', field: '', as: 'tag_rank' }],
        sort: [{ field: 'count', order: 'descending' }],
      },
      {
        filter: `datum.tag_rank <= ${maxShown}`,
      },
    ],
    encoding: {
      y: {
        field: 'group',
        sort: '-x',
        title: columns.join(', '),
      },
      x: {
        type: 'quantitative',
        field: 'count',
        title: 'Count',
      },
    },
  };

  return (
    <Box mt="md">
      <VegaLite actions={false} data={{ table: rows }} spec={spec} />
    </Box>
  );
}

AggregateBarChart.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.string).isRequired,
  maxShown: PropTypes.number,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
};

AggregateBarChart.defaultProps = {
  maxShown: 10,
};

export default function GenerationAnimation({
  columns,
  given,
  maxShown,
  minSamples,
  rows,
}) {
  const [limit, setLimit] = useState(1);

  const maxSamples = rows.length;

  return (
    <>
      <InputWrapper
        description="Choose the number of rows to be generated."
        label="Number of rows"
      >
        <Slider
          max={maxSamples}
          min={minSamples}
          marks={[
            { value: minSamples, label: minSamples },
            { value: maxSamples, label: maxSamples },
          ]}
          mb="xl"
          mt="md"
          onChange={setLimit}
        />
      </InputWrapper>
      <GenerateQuery columns={columns} given={given} limit={limit} />
      <AggregateBarChart
        columns={columns}
        maxShown={maxShown}
        rows={rows.slice(0, limit)}
      />
    </>
  );
}

GenerationAnimation.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.string).isRequired,
  given: PropTypes.object.isRequired,
  maxShown: PropTypes.number,
  minSamples: PropTypes.number,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
};

GenerationAnimation.defaultProps = {
  maxShown: 10,
  minSamples: 1,
};
