import type { HistoryState } from "../../types";
import { formatDateTime } from "../../utils";
import styles from "./style.module.css";

type Props = { data: HistoryState[] };

const HistoryStatesList = (props: Props) => {
  const { data } = props;

  if (data.length === 0) return <p className={styles.empty}>Нет данных</p>;

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead className={styles.head}>
          <tr>
            <th className={styles.col_start_date}>Дата начала</th>
            <th className={styles.col_finish_date}>Дата завершения</th>
            <th className={styles.col_state}>Состояние</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td className={styles.col_start_date}>
                {formatDateTime(item.start_date)}
              </td>
              <td className={styles.col_finish_date}>
                {formatDateTime(item.finish_date)}
              </td>
              <td className={styles.col_state}>{item.state}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryStatesList;
