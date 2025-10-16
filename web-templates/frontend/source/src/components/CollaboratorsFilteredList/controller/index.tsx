import { useCallback, useEffect, useState } from "react";
import type { Collaborator } from "../../../types";
import type { Rule } from "../types";
import { FilteredListModel } from "../model";
import { useDebounce } from "../../../hooks";

export type GetRemoteDataFunc = (rule: Rule) => Promise<Collaborator[]>;

export const useFilteredList = (getRemoteData: GetRemoteDataFunc) => {
  const [model] = useState(new FilteredListModel());
  const [, setRerender] = useState({});

  const update = () => setRerender({});
  const rule = model.getRule();
  let newIsSubscription: null | boolean = null;

  const loadData = useCallback(async (rule: Rule) => {
    try {
      model.setIsLoading(true);
      update();
      const data = await getRemoteData(rule);
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
    model.setRule({ ...rule, query: value });
    update();
  };
  const changeParentId = (value: string | null) => {
    model.setRule({ ...rule, position_parent_id: value || undefined });
    update();
  };
  const changeIsSubscription = (value: boolean) => {
    model.setRule({ ...rule, is_subscription: value });
    update();
  };

  const debouncedLoadData = useDebounce(loadData, 300);

  const handleInputChange = (value: string) => {
    changeQuery(value);
    debouncedLoadData({ ...rule, query: value });
  };

  const handleParentIdChange = (value: string | null) => {
    changeParentId(value);
    debouncedLoadData({ ...rule, position_parent_id: value || undefined });
  };

  const handleIsSubscriptionChange = (value: boolean) => {
    changeIsSubscription(value);
    newIsSubscription = value;
    debouncedLoadData({ ...rule, is_subscription: value });
  };

  useEffect(() => {
    if (newIsSubscription !== null) loadData(rule);
  }, [newIsSubscription]);

  return {
    getState: () => model.getState(),
    rule,
    handleInputChange,
    handleParentIdChange,
    handleIsSubscriptionChange,
  };
};
