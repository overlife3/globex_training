import { createStrictContext } from "../../../react";

type TabsState = {
  activeTab: string;
  setActiveTab: (value: string) => void;
  registerTab: (value: string) => void;
};

export const TabsContext = createStrictContext<TabsState>();
