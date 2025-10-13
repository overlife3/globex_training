import { useEffect, useState } from "react";
import type { Collaborator } from "../../types";
import CollaboratorRow from "../ColllaboratorRow";
import CenteredModalWrapper from "../ui/CenteredModalWrapper";
import styles from "./style.module.css";
import { getCollaborators } from "../../api/getCollaborators";
import Loader from "../ui/Loader";

type Props = {
  subdivisionId: number;
  subdivisionName: string;
  onClose: () => void;
  isOpen: boolean;
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

const CollaboratorsListModal = (props: Props) => {
  const { subdivisionId, subdivisionName, isOpen, onClose } = props;
  const [state, setState] = useState(initialState);

  useEffect(() => {
    const getData = async (subdivisionId: number) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));
        const data = await getCollaborators(subdivisionId);
        setState((prev) => ({ ...prev, data, isLoading: false }));
      } catch (error) {
        setState((prev) => ({ ...prev, isLoading: false, error: error }));
        console.error(error);
      }
    };

    if (isOpen) getData(subdivisionId);
  }, [isOpen, subdivisionId]);

  return (
    <CenteredModalWrapper isOpen={isOpen} onClose={onClose}>
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
    </CenteredModalWrapper>
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
        <CollaboratorRow fullname={item.fullname} key={item.id} />
      ))}
    </div>
  );
};

export default CollaboratorsListModal;
