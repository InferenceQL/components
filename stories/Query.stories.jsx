import React from 'react';
import Query from '../src/Query';
import cars from './assets/cars.json';
import carsTypes from './assets/cars.types.json';
import penguins from './assets/penguins.json';
import penguinsTypes from './assets/penguins.types.json';

export default {
  title: 'Query',
  component: Query,
  argTypes: {},
};

function Template(args) {
  return <Query {...args} />;
}

const makeExecute = (data, timeout) => () =>
  new Promise((res) =>
    setTimeout(
      () =>
        res({
          columns: [...new Set(data.flatMap((datum) => Object.keys(datum)))],
          rows: data,
        }),
      timeout || 250
    )
  );

const cats = [
  { name: 'Disco', age: 16, color: 'brown' },
  { name: 'Henry', age: 14, color: 'orange' },
  { name: 'Zelda', age: 13, color: 'black' },
];

const failingExecute = () => Promise.reject(new Error('oh no'));

export const Empty = Template.bind({});
Empty.args = {
  execute: makeExecute(cats),
};

export const Populated = Template.bind({});
Populated.args = {
  execute: makeExecute(cats),
  initialQuery: 'SELECT * FROM data',
};

export const Slow = Template.bind({});
Slow.args = {
  execute: makeExecute(cats, 5000),
  initialQuery: 'SELECT * FROM data',
};

export const Fail = Template.bind({});
Fail.args = {
  execute: failingExecute,
  initialQuery: 'SELECT * FROM data',
};

export const Cars = Template.bind({});
Cars.args = {
  execute: makeExecute(cars),
  initialQuery: 'SELECT * FROM cars',
  statType: (col) => carsTypes[col],
};

export const Penguins = Template.bind({});
Penguins.args = {
  execute: makeExecute(penguins),
  initialQuery: 'SELECT * FROM penguins',
  statType: (col) => penguinsTypes[col],
};
