import { memo, useState } from "react";
import styles from "./style.module.css";
import CollaboratorDataModalContent from "../../CollaboratorDataModalContent";
import CenteredModalWrapper from "../../ui/CenteredModalWrapper";
import { subscribeCurUserToCollaborator } from "../../../api/subscribeCurUserToCollaborator";
import ActionButton from "../../ui/ActionButton";
import Tooltip from "../../ui/Tooltip";

type Props = {
  collaboratorId: string;
  fullname: string;
};

const Row = memo((props: Props) => {
  const { fullname, collaboratorId } = props;
  const [isOpenModal, setIsOpenModal] = useState(false);

  return (
    <>
      <div
        className={styles.container}
        onClick={() => {
          setIsOpenModal(true);
        }}
      >
        <span className={styles.label}>{fullname}</span>
        <div className={styles.button}>
          <Tooltip content="Добавить в команду" placement="bottom">
            <ActionButton
              onAction={() => subscribeCurUserToCollaborator(collaboratorId)}
              disableAfterSuccess
            >
              Добавить в команду
            </ActionButton>
          </Tooltip>
        </div>
      </div>
      <CenteredModalWrapper
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
      >
        <CollaboratorDataModalContent
          collaboratorFullname={fullname}
          collaboratorId={collaboratorId}
          onClose={() => setIsOpenModal(false)}
        />
      </CenteredModalWrapper>
    </>
  );
});

export default Row;
