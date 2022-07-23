import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import hljs from 'highlight.js/lib/core';
import { createStyles } from '@mantine/core';
import { useEditable } from 'use-editable';

const language = ({ regex }) => {
  const COMMA = {
    scope: 'punctuation',
    match: /,/,
    relevance: 0,
  };

  const KEYWORDS = [
    'and',
    'as',
    'asc',
    'by',
    'desc',
    'from',
    'group',
    'limit',
    'or',
    'order',
    'select',
    'where',
  ];

  const BUILT_IN = ['conditioned', 'constrained', 'generate', 'under'];

  const LITERALS = ['true', 'false', 'NULL'];

  const OPERATORS = ['>', '>=', '=', '<=', '<'];

  const OPERATOR = {
    className: 'operator',
    match: regex.either(...OPERATORS),
  };

  const STRING = {
    className: 'string',
    match: /"(?:[^"]*)+"/,
  };

  const VARIABLE = {
    className: 'variable',
    match: /(?<=VAR\s+)[^0-9\s][\w\-_?.]*\b/,
  };

  const NUMBER = {
    scope: 'number',
    match: /\b-?[0-9]+\.?(?:[0-9]+)?\b/,
  };

  const SCALAR = {
    begin: /(?<=\b(SELECT|WHERE|ORDER\s+BY|LIMIT)\b)/,
    end: /(?=\b(ASC|AS|DESC|FROM|GROUP|WHERE|ORDER\s+BY)\b)/,
    keywords: {
      built_in: [
        'and',
        'by',
        'conditioned',
        'constrained',
        'density',
        'given',
        'of',
        'or',
        'probability',
        'under',
        'var',
      ],
    },
    contains: [COMMA, NUMBER, OPERATOR, STRING, VARIABLE],
  };

  return {
    name: 'IQL',
    aliases: ['iql'],
    case_insensitive: true,
    keywords: {
      keyword: KEYWORDS,
      built_in: BUILT_IN,
      literal: LITERALS,
    },
    contains: [COMMA, SCALAR],
  };
};

hljs.registerLanguage('iql', language);
hljs.configure({ languages: ['iql', 'sql'] });

const useStyles = createStyles((theme, { error }) => ({
  pre: {
    margin: 0,
  },
  code: {
    '&[disabled]': {
      background: theme.colors.gray[0],
      cursor: 'not-allowed',
    },
    '&:focus-visible': {
      borderColor: error ? theme.colors.red : theme.colors.blue[6],
    },
    '&:empty': {
      minHeight: '15px',
    },
    borderColor: error ? theme.colors.red : theme.colors.gray[4],
    borderRadius: theme.radius.sm,
    borderStyle: 'solid',
    borderWidth: '1px',
    display: 'block',
    outlineStyle: 'none',
    overflowX: 'auto',
    padding: theme.spacing.xs,
    whiteSpace: 'pre',
  },
}));

const HighlightInput = React.forwardRef(
  (
    {
      className,
      classNames,
      disabled,
      error,
      indentation,
      onChange,
      onKeyDown,
      styles,
      value,
      ...rest
    },
    forwardedRef
  ) => {
    const ref = forwardedRef ?? useRef();
    const { classes, cx } = useStyles({ error }, { classNames, styles });

    useEditable(ref, onChange, { disabled, indentation });

    const handleKeyDown = (event, ...params) => {
      if (onKeyDown) onKeyDown(event, ...params);

      if (event.key === 'Backspace' && event.altKey) {
        // Without this only one character is deleted.
        event.stopPropagation();
      }
    };

    const { value: innerHTML } = hljs.highlight(value, { language: 'iql' });

    /* eslint-disable react/no-danger  */
    /* eslint-disable jsx-a11y/no-static-element-interactions */
    return (
      <pre className={classes.pre}>
        <code
          className={cx(classes.code, className)}
          disabled={disabled}
          onKeyDown={handleKeyDown}
          ref={ref}
          style={{ whiteSpace: 'pre' }}
          dangerouslySetInnerHTML={{ __html: innerHTML }}
          {...rest}
        />
      </pre>
    );
  }
);
HighlightInput.displayName = 'HighlightInput';
export default HighlightInput;

HighlightInput.propTypes = {
  className: PropTypes.string,
  classNames: PropTypes.object,
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  indentation: PropTypes.number,
  onChange: PropTypes.func,
  onKeyDown: PropTypes.func,
  styles: PropTypes.object,
  value: PropTypes.string,
};

HighlightInput.defaultProps = {
  className: undefined,
  classNames: undefined,
  disabled: false,
  error: false,
  indentation: 2,
  onChange: undefined,
  onKeyDown: undefined,
  styles: undefined,
  value: '',
};
