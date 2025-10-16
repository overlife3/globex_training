import clsx from "clsx";
import { useStrictContext } from "../../../../react";
import { TabsContext } from "../context";
import styles from "./style.module.css";
import { useLayoutEffect } from "react";

type Props = {
  value: string;
  label: string;
};

const Tab = (props: Props) => {
  const { value, label } = props;

  const { activeTab, setActiveTab, registerTab } =
    useStrictContext(TabsContext);

  const handleClick = () => {
    setActiveTab(value);
  };

  useLayoutEffect(() => {
    registerTab(value);
  }, [value, registerTab]);

  return (
    <div
      className={clsx(styles.tab, {
        [styles.active]: value === activeTab,
      })}
      onClick={handleClick}
    >
      {label}
    </div>
  );
};

export default Tab;
