import { memo, useState } from "react";
import styles from "./style.module.css";
import CollaboratorDataModalContent from "../../CollaboratorDataModalContent";
import CenteredModalWrapper from "../../ui/CenteredModalWrapper";
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
        {fullname}
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
