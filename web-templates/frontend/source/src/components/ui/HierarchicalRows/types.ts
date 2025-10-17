export type HierarchicalItem = {
  label: string;
  id: string;
  parentId: string | null;
  level: number;
};

export type RenderRowContentFunc = (item: HierarchicalItem) => React.ReactNode;
