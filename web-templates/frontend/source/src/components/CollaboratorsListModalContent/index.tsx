import { useEffect, useState } from "react";
import type { Collaborator } from "../../types";
import styles from "./style.module.css";
import { getCollaboratorsBySubdivisionId } from "../../api/getCollaboratorsBySubdivisionId";
import Loader from "../ui/Loader";
import Row from "./Row";

type Props = {
  subdivisionId: string;
  subdivisionName: string;
  onClose: () => void;
};

type State = {
  data: Collaborator[];
  isLoading: boolean;
  error: unknown | null;
};

const initialState: State = {
  data: [],
  isLoading: false,
  error: null,
};

const CollaboratorsListModalContent = (props: Props) => {
  const { subdivisionId, subdivisionName, onClose } = props;
  const [state, setState] = useState(initialState);

  useEffect(() => {
    const getData = async (subdivisionId: string) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));
        const data = await getCollaboratorsBySubdivisionId(subdivisionId);
        setState((prev) => ({ ...prev, data, isLoading: false }));
      } catch (error) {
        setState((prev) => ({ ...prev, isLoading: false, error: error }));
        console.error(error);
      }
    };

    getData(subdivisionId);
  }, [subdivisionId]);

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <p>
          Сотрудники подразделения{" "}
          <span className={styles.sub_name}>{subdivisionName}</span>:
        </p>
      </div>
      <div className={styles.cross} onClick={onClose}>
        X
      </div>
      {generateContent(state)}
    </div>
  );
};

const generateContent = (state: State) => {
  if (state.isLoading) {
    return (
      <div className={styles.loader}>
        <Loader size="medium" />
      </div>
    );
  }

  if (state.error) {
    return <div className={styles.error}>Произошла ошибка</div>;
  }

  if (state.data.length === 0) {
    return <div>В выбранном подразделении нет сотрудников</div>;
  }

  return (
    <div className={styles.list}>
      {state.data.map((item) => (
        <Row fullname={item.fullname} key={item.id} />
      ))}
    </div>
  );
};

export default CollaboratorsListModalContent;
