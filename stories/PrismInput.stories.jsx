import React, { useState } from 'react';
import PrismInput from '../src/PrismInput';

export default {
  title: 'PrismInput',
  component: PrismInput,
  argTypes: {},
};

function Template({ value, disabled, onKeyDown }) {
  const [valueState, setValue] = useState(value);
  return (
    <PrismInput
      disabled={disabled}
      onChange={setValue}
      onKeyDown={onKeyDown}
      value={valueState}
    />
  );
}

Template.propTypes = PrismInput.propTypes;
Template.defaultProps = PrismInput.defaultProps;

export const Empty = Template.bind({});
Empty.args = {
  value: '',
};

export const SingleLine = Template.bind({});
SingleLine.args = {
  value: 'SELECT * FROM data;',
};

export const MultiLine = Template.bind({});
MultiLine.args = {
  value: 'SELECT *\nFROM data\nWHERE x > 0;',
};
