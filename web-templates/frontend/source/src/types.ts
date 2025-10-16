export type Collaborator = {
  id: string;
  fullname: string;
};

export type Subdivision = {
  id: string;
  name: string;
  parent_object_id: string | null;
};

export type SubdivisionWithHierarchical = Subdivision & {
  level: number;
};

export type CollaboratorData = {
  change_logs: ChangeLog[];
  history_states: HistoryState[];
};

export type ChangeLog = {
  date: string;
  position_name: string;
  position_parent_name: string;
  org_name: string;
};

export type HistoryState = {
  start_date: string;
  finish_date: string;
  state: string;
};
