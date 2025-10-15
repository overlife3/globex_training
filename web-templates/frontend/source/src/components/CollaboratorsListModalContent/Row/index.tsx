import { memo } from "react";
import styles from "./style.module.css";
type Props = {
  fullname: string;
};

const Row = memo((props: Props) => {
  const { fullname } = props;
  return <div className={styles.container}>{fullname}</div>;
});

export default Row;
