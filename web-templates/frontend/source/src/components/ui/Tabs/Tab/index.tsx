import clsx from "clsx";
import { useStrictContext } from "../../../../react";
import { TabsContext } from "../context";
import styles from "./style.module.css";

type Props = {
  value: number;
  label: string;
};

const Tab = (props: Props) => {
  const { value, label } = props;

  const { activeTab, setActiveTab } = useStrictContext(TabsContext);

  const handleClick = () => {
    setActiveTab(value);
  };

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
