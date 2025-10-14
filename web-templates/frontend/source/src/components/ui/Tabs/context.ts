import { createStrictContext } from "../../../react";

type TabsState = {
  activeTab: number;
  setActiveTab: (value: number) => void;
};

export const TabsContext = createStrictContext<TabsState>();
