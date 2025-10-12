import styles from "./style.module.css";
type Props = {
  fullname: string;
};

const CollaboratorRow = (props: Props) => {
  const { fullname } = props;
  return <div className={styles.container}>{fullname}</div>;
};

export default CollaboratorRow;
