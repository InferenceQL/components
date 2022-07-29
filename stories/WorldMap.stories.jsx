import React from 'react';
import WorldMap from '../src/WorldMap';
import satellites from './assets/satellites.json';
import satellitesTypes from './assets/satellites.types.json';

export default {
  title: 'WorldMap',
  component: WorldMap,
  argTypes: {},
};

function Template(args) {
  return <WorldMap {...args} />;
}

export const Example = Template.bind({});
Example.args = {
  data: satellites,
  types: satellitesTypes,
};
