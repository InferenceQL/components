import React from 'react';
import PairPlot from '../src/PairPlot';
import cars from './assets/cars.json';
import carsTypes from './assets/cars.types.json';
import penguins from './assets/penguins.json';
import penguinsTypes from './assets/penguins.types.json';

export default {
  title: 'PairPlot',
  component: PairPlot,
  argTypes: {},
};

function Template(args) {
  return <PairPlot {...args} />;
}

export const Count = Template.bind({});
Count.args = {
  data: [
    { cat: 'Henry', count: 23 },
    { cat: 'Disco', count: 13 },
    { cat: 'Zelda', count: 7 },
  ],
  types: {
    cat: 'nominal',
    count: 'quantitative',
  },
};

export const Cars = Template.bind({});
Cars.args = {
  data: cars,
  types: carsTypes,
};

export const Penguins = Template.bind({});
Penguins.args = {
  data: penguins,
  types: penguinsTypes,
};

export const Missing = Template.bind({});
Missing.args = {
  data: penguins,
  // The 'Sex' column has missing values, so we include it here with one nominal
  // column and one numerical column.
  types: (({ Sex, Species, 'Body Mass (g)': mass }) => ({
    Sex,
    Species,
    'Body Mass (g)': mass,
  }))(penguinsTypes),
};
