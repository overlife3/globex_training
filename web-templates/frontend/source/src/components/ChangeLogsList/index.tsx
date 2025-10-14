import type { ChangeLog } from "../../types";
import { formatDateTime } from "../../utils";
import styles from "./style.module.css";

type Props = {
  data: ChangeLog[];
};

const ChangeLogsList = (props: Props) => {
  const { data } = props;

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead className={styles.head}>
          <tr>
            <th className={styles.col_date}>Дата</th>
            <th className={styles.col_position_name}>Название должности</th>
            <th className={styles.col_position_parent_name}>
              Название подразделения
            </th>
            <th className={styles.col_org_name}>Название организации</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr>
              <td className={styles.col_date}>{formatDateTime(item.date)}</td>
              <td className={styles.col_position_name}>{item.position_name}</td>
              <td className={styles.col_position_parent_name}>
                {item.position_parent_name}
              </td>
              <td className={styles.col_org_name}>{item.org_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChangeLogsList;
