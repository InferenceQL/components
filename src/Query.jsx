import PropTypes from 'prop-types';
import React from 'react';
import { ArrowBackUp, Database } from 'tabler-icons-react';
import { Button, Loader, Paper, Space, Tabs } from '@mantine/core';
/* eslint-disable import/no-named-default */
import { default as Input } from './HighlightInput';
// import { default as Input } from './PrismInput';
import DataTable from './DataTable';
import PairPlot from './PairPlot';

const usePrevious = (value) => {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export default function Query({ execute, initialQuery, statType }) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [queryValue, setQueryValue] = React.useState(initialQuery || '');
  const [queryResult, setQueryResult] = React.useState();
  const [errorValue, setErrorValue] = React.useState();
  const [activeTab, setActiveTab] = React.useState(0);

  const buttonRef = React.useRef();
  const editorRef = React.useRef();

  const handleExecute = () => {
    execute(queryValue)
      .then(setQueryResult)
      .catch(setErrorValue)
      .finally(() => setIsLoading(false));
    setIsLoading(true);
  };

  const onChange = (value) => {
    setQueryValue(value);
    setErrorValue();
  };

  const handleReset = () => setQueryResult();

  const onKeyDown = (event) => {
    if (event.key === 'Enter' && event.shiftKey) {
      event.stopPropagation();
      event.preventDefault();
      handleExecute();
    }
  };

  const previousQueryResult = usePrevious(queryResult);
  React.useEffect(() => {
    if (!queryResult && previousQueryResult) {
      editorRef.current.focus();
    } else if (queryResult && !previousQueryResult) {
      buttonRef.current.focus();
    }
  }, [buttonRef, queryResult, previousQueryResult]);

  return (
    <Paper p="sm" radius="sm" shadow="md" withBorder>
      <Input
        disabled={isLoading || Boolean(queryResult)}
        error={Boolean(errorValue)}
        onChange={onChange}
        onKeyDown={onKeyDown}
        ref={editorRef}
        value={queryValue}
      />
      {queryResult ? (
        <Button
          leftIcon={<ArrowBackUp />}
          mt="md"
          ref={buttonRef}
          variant="default"
          onClick={handleReset}
        >
          Reset
        </Button>
      ) : (
        <Button
          disabled={isLoading}
          leftIcon={
            isLoading ? <Loader size="sm" variant="dots" /> : <Database />
          }
          mt="md"
          ref={buttonRef}
          variant="default"
          onClick={handleExecute}
        >
          Execute
        </Button>
      )}
      {queryResult && (
        <>
          <Space h="sm" />
          <Tabs active={activeTab} onTabChange={setActiveTab}>
            <Tabs.Tab label="Table">
              <DataTable
                columns={queryResult.columns}
                pagination={false}
                rows={queryResult.rows}
              />
            </Tabs.Tab>
            {statType && (
              <Tabs.Tab label="Plots">
                <PairPlot
                  data={queryResult.rows}
                  types={Object.fromEntries(
                    queryResult.columns
                      .map((col) => [col, statType(col)])
                      .filter(([col, type]) => col && type)
                  )}
                />
              </Tabs.Tab>
            )}
          </Tabs>
        </>
      )}
    </Paper>
  );
}

Query.propTypes = {
  execute: PropTypes.func.isRequired,
  statType: PropTypes.func,
  initialQuery: PropTypes.string,
};

Query.defaultProps = {
  initialQuery: undefined,
  statType: undefined,
};
