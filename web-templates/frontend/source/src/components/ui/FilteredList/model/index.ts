import type { FilteredListByUrlModelState } from "../types";

export class FilteredListModel<T> {
  private state: FilteredListByUrlModelState<T>;

  constructor() {
    this.state = {
      query: "",
      isLoading: false,
      data: [],
      error: null,
    };
  }

  getState() {
    return this.state;
  }

  getQuery() {
    return this.state.query;
  }

  setQuery(value: string) {
    this.state.query = value;
  }

  getIsLoading() {
    return this.state.isLoading;
  }

  setIsLoading(value: boolean) {
    this.state.isLoading = value;
  }

  setData(value: T[]) {
    this.state.data = value;
  }

  setError(value: string) {
    this.state.error = value;
  }
  getError() {
    return this.state.error;
  }
}
