import { getCollaboratorsByRule } from "../../api/getCollaboratorsByRule";
import { CollaboratorsFilteredList } from "../CollaboratorsFilteredList";
import Row from "./Row";
import styles from "./style.module.css";

const CollaboratorsWithoutSubscribeFilteredList = () => {
  return (
    <CollaboratorsFilteredList
      getRemoteData={getCollaboratorsByRule}
      isSubscription={false}
      renderList={(data) => {
        return (
          <div className={styles.list}>
            {data.map((item) => (
              <Row
                collaboratorId={item.id}
                fullname={item.fullname}
                key={item.id}
              />
            ))}
          </div>
        );
      }}
      renderEmpty={() => <p>Список пуст</p>}
    />
  );
};

export default CollaboratorsWithoutSubscribeFilteredList;
