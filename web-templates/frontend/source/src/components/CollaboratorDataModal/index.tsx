import { useEffect, useState } from "react";
import type { CollaboratorData } from "../../types";
import { getCollaboratorData } from "../../api/getCollaboratorData";
import CenteredModalWrapper from "../ui/CenteredModalWrapper";
import styles from "./style.module.css";
import Loader from "../ui/Loader";
import ChangeLogsList from "../ChangeLogsList";
import HistoryStatesList from "../HistoryStatesList";

type Props = {
  collaboratorId: string;
  collaboratorFullname: string;
  onClose: () => void;
  isOpen: boolean;
};

type State = {
  data: CollaboratorData | null;
  isLoading: boolean;
  error: unknown | null;
};

const initialState: State = {
  data: null,
  isLoading: false,
  error: null,
};

const CollaboratorDataModal = (props: Props) => {
  const { collaboratorFullname, collaboratorId, isOpen, onClose } = props;
  const [state, setState] = useState(initialState);

  useEffect(() => {
    const getData = async (collaboratorId: string) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));
        const data = await getCollaboratorData(collaboratorId);
        setState((prev) => ({ ...prev, data, isLoading: false }));
      } catch (error) {
        setState((prev) => ({ ...prev, isLoading: false, error: error }));
        console.error(error);
      }
    };

    if (isOpen) getData(collaboratorId);
  }, [isOpen, collaboratorId]);
  return (
    <CenteredModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <div className={styles.title}>
          <p>
            Данные сотрудника:{" "}
            <span className={styles.name}>{collaboratorFullname}</span>:
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

  if (state.data === null) {
    return <div className={styles.empty}>Нет данных</div>;
  }

  return (
    <div className={styles.content}>
      <div className={styles.table_block}>
        <p>История измененией:</p>
        <ChangeLogsList data={state.data.change_logs} />
      </div>
      <div className={styles.table_block}>
        <p>Список состояний</p>
        <HistoryStatesList data={state.data.history_states} />
      </div>
    </div>
  );
};

export default CollaboratorDataModal;
