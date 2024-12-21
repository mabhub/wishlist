import React from 'react';

const useData = () => {
  const [data, setData] = React.useState();

  const getData = React.useCallback(
    async () => {
      setData(await import('./data.json'));
    },
    [],
  );

  React.useEffect(
    () => { getData(); },
    [getData],
  );

  return React.useMemo(
    () => {
      if (!data) return [[], []];

      const itemCategories = Array.from(data.items.reduce((acc, { categories = [] }) => {
        categories.length && acc.add(...categories);
        return acc;
      }, new Set()));

      return [data.items, itemCategories];
    },
    [data],
  );
};

export default useData;
