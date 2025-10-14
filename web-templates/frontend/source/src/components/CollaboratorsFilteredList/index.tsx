import { getCollaboratorsByQuery } from "../../api/getCollaboratorsByQuery";
import { FilteredList } from "../ui/FilteredList";
import Row from "./Row";
import styles from "./style.module.css";

const CollaboratorsFilteredList = () => {
  return (
    <FilteredList
      getRemoteData={getCollaboratorsByQuery}
      renderList={(data) => {
        return (
          <div className={styles.list}>
            {data.map((item) => (
              <Row collaboratorId={item.id} fullname={item.fullname} />
            ))}
          </div>
        );
      }}
    />
  );
};

export default CollaboratorsFilteredList;
