import styles from "./style.module.css";

type Props = {
  children: React.ReactNode;
};

const List = (props: Props) => {
  const { children } = props;

  return <div className={styles.list}>{children}</div>;
};

export default List;
