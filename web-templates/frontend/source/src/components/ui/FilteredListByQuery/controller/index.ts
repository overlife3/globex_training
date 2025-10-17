import { useCallback, useEffect, useState } from "react";
import { FilteredListByQueryModel } from "../model";
import { useDebounce } from "../../../../hooks";

export type GetRemoteDataFunc<T> = (query: string) => Promise<T[]>;

export const useFilteredListByQuery = <T>(
  getRemoteData: GetRemoteDataFunc<T>
) => {
  const [model] = useState(new FilteredListByQueryModel<T>());
  const [, setRerender] = useState({});

  const update = () => setRerender({});
  const query = model.getQuery();

  const loadData = useCallback(async (query: string) => {
    try {
      model.setIsLoading(true);
      update();
      const data = await getRemoteData(query);
      model.setData(data);
      model.setIsLoading(false);
      update();
    } catch (err) {
      if (err instanceof Error) {
        model.setError(err.message);
        model.setData([]);
        model.setIsLoading(false);
        console.error(err);
        update();
      } else console.error(err);
    }
  }, []);

  const changeQuery = (value: string) => {
    model.setQuery(value);
    update();
  };

  const debouncedLoadData = useDebounce(loadData, 300);

  const handleInputChange = (value: string) => {
    changeQuery(value);
    debouncedLoadData(value);
  };

  useEffect(() => {
    loadData("");
  }, []);

  return {
    getState: () => model.getState(),
    query,
    handleInputChange,
  };
};
