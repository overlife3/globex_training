export type FilteredListModelState<T> = {
  rule: Rule;
  isLoading: boolean;
  data: T[];

  error: string | null;
};

export type Rule = {
  query: string;
  position_parent_id?: string;
  is_subscription: boolean;
};
