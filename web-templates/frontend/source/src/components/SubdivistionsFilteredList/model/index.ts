import type { Subdivision } from "../../../types";
import type { FilteredListByUrlModelState } from "../types";

export class SubdivisionsFilteredListModel {
  private state: FilteredListByUrlModelState;

  constructor() {
    this.state = {
      query: "",
      isLoading: false,
      subdivisions: [],
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

  setSubdivisions(value: Subdivision[]) {
    this.state.subdivisions = value;
  }

  setError(value: string) {
    this.state.error = value;
  }
  getError() {
    return this.state.error;
  }
}
