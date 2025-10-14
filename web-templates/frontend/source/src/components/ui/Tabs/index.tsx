import { useState } from "react";
import { TabsContext } from "./context";
import List from "./List";
import Panel from "./Panel";
import Tab from "./Tab";

type Props = {
  children: React.ReactNode;
};

export const Tabs = (props: Props) => {
  const [activeTab, setActiveTab] = useState(0);

  const { children } = props;

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
};

Tabs.List = List;
Tabs.Panel = Panel;
Tabs.Tab = Tab;
