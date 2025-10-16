import type { Collaborator } from "../../../types";
import type { FilteredListModelState, Rule } from "../types";

export class FilteredListModel {
  private state: FilteredListModelState<Collaborator>;

  constructor() {
    this.state = {
      rule: {
        is_subscription: true,
        position_parent_id: undefined,
        query: "",
      },
      isLoading: false,
      data: [],
      error: null,
    };
  }

  getState() {
    return this.state;
  }

  getRule() {
    return this.state.rule;
  }

  setRule(value: Rule) {
    this.state.rule = value;
  }

  getIsLoading() {
    return this.state.isLoading;
  }

  setIsLoading(value: boolean) {
    this.state.isLoading = value;
  }

  setData(value: Collaborator[]) {
    this.state.data = value;
  }

  setError(value: string) {
    this.state.error = value;
  }
  getError() {
    return this.state.error;
  }
}
