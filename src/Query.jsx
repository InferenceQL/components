import { ArrowBackUp, Database } from 'tabler-icons-react';
import { Button, LoadingOverlay, Paper, Tabs } from '@mantine/core';
import { getHotkeyHandler } from '@mantine/hooks';
import React from 'react';
import PropTypes from 'prop-types';
import DataTable from './DataTable';
import HighlightInput from './HighlightInput';
import PairPlot from './PairPlot';

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

  const handleClear = () => setQueryResult();

  const onChange = (value) => {
    setQueryValue(value);
    setErrorValue();
  };

  const onKeyDown = getHotkeyHandler([
    ['mod+Enter', handleExecute],
    ['shift+Enter', handleExecute],
  ]);

  return (
    <Paper p="xs" radius="xs" shadow="md" withBorder>
      <HighlightInput
        disabled={isLoading}
        error={Boolean(errorValue)}
        onChange={onChange}
        onKeyDown={onKeyDown}
        ref={editorRef}
        value={queryValue}
      />

      <Button
        disabled={isLoading}
        loading={isLoading}
        leftIcon={<Database size={18} />}
        mt="sm"
        mr="sm"
        ref={buttonRef}
        variant="default"
        onClick={handleExecute}
      >
        Execute
      </Button>

      {queryResult && (
        <Button
          leftIcon={<ArrowBackUp size={18} />}
          mt="sm"
          ref={buttonRef}
          variant="default"
          onClick={handleClear}
        >
          Clear
        </Button>
      )}

      {queryResult && (
        <Tabs mt="sm" active={activeTab} onTabChange={setActiveTab}>
          <Tabs.Tab label="Table">
            <div style={{ position: 'relative' }}>
              <LoadingOverlay visible={isLoading} transitionDuration={0} />
              <DataTable
                columns={queryResult.columns}
                pagination={false}
                rows={queryResult.rows}
              />
            </div>
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
