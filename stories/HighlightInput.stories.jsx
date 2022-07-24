import 'highlight.js/styles/github.css';
import React, { useState } from 'react';
import HighlightInput from '../src/HighlightInput';

export default {
  title: 'HighlightInput',
  component: HighlightInput,
  argTypes: {},
};

function Template({ disabled, error, value }) {
  const [valueState, setValueState] = useState(value);

  const setValueStateWrapper = (valuee) => {
    setValueState(valuee);
  };

  return (
    <HighlightInput
      disabled={disabled}
      error={error}
      value={valueState}
      onChange={setValueStateWrapper}
    />
  );
}

Template.propTypes = HighlightInput.propTypes;
Template.defaultProps = HighlightInput.defaultProps;

export const Empty = Template.bind({});
Empty.args = {
  value: '',
};

export const SingleLine = Template.bind({});
SingleLine.args = {
  value: 'SELECT * FROM data;',
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  value: 'SELECT * FROM data;',
};

export const Error = Template.bind({});
Error.args = {
  error: true,
  value: 'SELECT * FROM data;',
};

export const MultiLine = Template.bind({});
MultiLine.args = {
  value: 'SELECT *\nFROM data\nWHERE x > 0;',
};

export const ProbabilityOf = Template.bind({});
ProbabilityOf.args = {
  value: `SELECT
  Period_minutes,
  Class_of_Orbit,

  PROBABILITY DENSITY OF VAR Period_minutes
  UNDER satellites_model
  CONDITIONED BY VAR Class_of_Orbit="GEO"
FROM satellites`,
};
