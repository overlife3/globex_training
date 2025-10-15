import { getSubdivisionsByQuery } from "../../api/getSubdivisionsByQuery";
import { FilteredList } from "../ui/FilteredList";
import Row from "./Row";
import styles from "./style.module.css";

const SubdivisionsFilteredList = () => {
  return (
    <FilteredList
      getRemoteData={getSubdivisionsByQuery}
      renderList={(data) => {
        return (
          <div className={styles.list}>
            {data.map((item) => (
              <Row id={item.id} name={item.name} key={item.id} />
            ))}
          </div>
        );
      }}
      renderEmpty={() => <p>Список пуст</p>}
    />
  );
};

export default SubdivisionsFilteredList;
