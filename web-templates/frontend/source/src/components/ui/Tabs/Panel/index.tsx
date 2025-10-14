import { useStrictContext } from "../../../../react";
import { TabsContext } from "../context";
import styles from "./style.module.css";

type Props = {
  value: number;
  children: React.ReactNode;
};

const Panel = (props: Props) => {
  const { children, value } = props;

  const { activeTab } = useStrictContext(TabsContext);

  return value === activeTab ? (
    <div className={styles.container}>{children}</div>
  ) : null;
};

export default Panel;
