import PropTypes from 'prop-types';
import React from 'react';
import { Table } from '@mantine/core';

export default function DataTable({ columns, rows }) {
  const tds = rows.map((row, rowIndex) => {
    /* eslint-disable react/no-array-index-key */
    const cells = columns.map((column, colIndex) => (
      <td key={colIndex}>{row[column]}</td>
    ));
    return <tr key={rowIndex}>{cells}</tr>;
  });

  /* eslint-disable react/no-array-index-key */
  const tr = (
    <tr>
      {columns.map((column, index) => (
        <th key={index}>{column}</th>
      ))}
    </tr>
  );

  return (
    <Table striped style={{ display: 'block', overflowX: 'scroll' }}>
      <thead>{tr}</thead>
      <tbody>{tds}</tbody>
    </Table>
  );
}

DataTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.string),
  rows: PropTypes.arrayOf(
    PropTypes.objectOf(
      PropTypes.oneOfType([PropTypes.bool, PropTypes.number, PropTypes.string])
    )
  ),
};

DataTable.defaultProps = {
  columns: undefined,
  rows: undefined,
};
