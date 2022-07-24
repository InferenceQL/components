import React from 'react';
import DataTable from '../src/DataTable';
import cars from './assets/cars.json';
import penguins from './assets/penguins.json';

export default {
  title: 'DataTable',
  component: DataTable,
  argTypes: {},
};

function Template(args) {
  return <DataTable {...args} />;
}

const columns = (data) => [
  ...new Set(data.flatMap((datum) => Object.keys(datum))),
];

export const Cars = Template.bind({});
Cars.args = {
  columns: columns(cars),
  rows: cars,
};

export const Penguins = Template.bind({});
Penguins.args = {
  columns: columns(penguins),
  rows: penguins,
};
