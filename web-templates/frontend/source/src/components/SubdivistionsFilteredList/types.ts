import type { Subdivision } from "../../types";

export type FilteredListByUrlModelState = {
  query: string;
  isLoading: boolean;
  subdivisions: Subdivision[];
  error: string | null;
};
