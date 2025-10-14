export type FilteredListByUrlModelState<T> = {
  query: string;
  isLoading: boolean;
  data: T[];

  error: string | null;
};
