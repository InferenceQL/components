import { ArrowBackUp, Database } from 'tabler-icons-react';
import { Button, LoadingOverlay, Paper, Tabs } from '@mantine/core';
import { getHotkeyHandler } from '@mantine/hooks';
import React from 'react';
import PropTypes from 'prop-types';
import DataTable from './DataTable';
import HighlightInput from './HighlightInput';
import PairPlot from './PairPlot';
import WorldMap from './WorldMap';

const useClearableState = (initialValue) => {
  const [value, setValue] = React.useState(initialValue);
  const clearValue = () => setValue();
  return [value, setValue, clearValue];
};

const useSwitch = (initialValue) => {
  const [value, setValue] = React.useState(initialValue);
  const setTrue = () => setValue(true);
  const setFalse = () => setValue(false);
  return [value, setTrue, setFalse];
};

const both =
  (f1, f2) =>
  (...args) => {
    f1.apply(this, args);
    f2.apply(this, args);
  };

export default function Query({ execute, initialQuery, statType }) {
  const [isLoading, setIsLoading, setNotLoading] = useSwitch(false);
  const [queryValue, setQueryValue] = React.useState(initialQuery || '');
  const [queryResult, setQueryResult, clearQueryResult] = useClearableState();
  const [errorValue, setErrorValue, clearErrorValue] = useClearableState();
  const [activeTab, setActiveTab] = React.useState(0);

  const buttonRef = React.useRef();
  const editorRef = React.useRef();

  const handleExecute = () => {
    execute(queryValue)
      .then(both(setQueryResult, clearErrorValue))
      .catch(both(setErrorValue, clearQueryResult))
      .finally(setNotLoading);
    setIsLoading();
  };

  const onKeyDown = getHotkeyHandler([
    ['mod+Enter', handleExecute],
    ['shift+Enter', handleExecute],
  ]);

  const mapShown =
    queryResult &&
    statType &&
    queryResult.columns.length === 2 &&
    queryResult.columns.map(statType).includes('quantitative') &&
    queryResult.columns.includes('Country_of_Operator');

  return (
    <Paper p="xs" radius="xs" shadow="md" withBorder>
      <HighlightInput
        disabled={isLoading}
        error={Boolean(errorValue)}
        onChange={both(setQueryValue, clearErrorValue)}
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
          onClick={clearQueryResult}
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
          {mapShown && (
            <Tabs.Tab label="Map">
              <WorldMap
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
