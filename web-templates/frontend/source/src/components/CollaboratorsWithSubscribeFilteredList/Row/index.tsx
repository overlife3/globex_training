import { memo, useState } from "react";
import styles from "./style.module.css";
import CollaboratorDataModalContent from "../../CollaboratorDataModalContent";
import CenteredModalWrapper from "../../ui/CenteredModalWrapper";
import ActionButton from "../../ui/ActionButton";
import { deleteSubscribeCurUserToCollaborator } from "../../../api/deleteSubscribeCurUserToCollaborator";
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
          <Tooltip content="Удалить из команды" placement="bottom">
            <ActionButton
              onAction={() =>
                deleteSubscribeCurUserToCollaborator(collaboratorId)
              }
              disableAfterSuccess
            >
              Удалить из команды
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
