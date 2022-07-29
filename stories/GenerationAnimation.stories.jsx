import React from 'react';
import GenerationAnimation from '../src/GenerationAnimation';
import rows from './assets/generated-rows.json';

export default {
  title: 'GenerationAnimation',
  component: GenerationAnimation,
  argTypes: {},
};

function Template(args) {
  return <GenerationAnimation {...args} />;
}

export const Top10 = Template.bind({});
Top10.args = {
  columns: ['Purpose', 'Country_of_Operator'],
  given: { Class_of_Orbit: 'GEO', Dry_mass_kg: 500 },
  maxShown: 10,
  rows,
};

export const Top5 = Template.bind({});
Top5.args = {
  columns: ['Purpose', 'Country_of_Operator'],
  given: { Class_of_Orbit: 'GEO', Dry_mass_kg: 500 },
  maxShown: 5,
  rows,
};
