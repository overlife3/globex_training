import { useEffect, useRef } from "react";
import { TabsContext } from "./context";
import List from "./List";
import Panel from "./Panel";
import Tab from "./Tab";
import { useSearchParams } from "react-router-dom";

type Props = {
  children: React.ReactNode;
  mainTab: string;
};

export const Tabs = (props: Props) => {
  const { children, mainTab } = props;

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || mainTab;

  const tabs = useRef<string[]>([]);

  const handleTabChange = (tabId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("tab", tabId);
    setSearchParams(newSearchParams);
  };

  useEffect(() => {
    if (!tabs.current.includes(activeTab)) {
      handleTabChange(mainTab);
    }
  }, [activeTab]);

  const registerTab = (tab: string) => {
    tabs.current.push(tab);
  };

  return (
    <TabsContext.Provider
      value={{ activeTab, setActiveTab: handleTabChange, registerTab }}
    >
      <div>{children}</div>
    </TabsContext.Provider>
  );
};

Tabs.List = List;
Tabs.Panel = Panel;
Tabs.Tab = Tab;
