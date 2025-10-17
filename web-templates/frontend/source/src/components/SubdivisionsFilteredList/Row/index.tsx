import { memo, useState } from "react";
import styles from "./style.module.css";
import CenteredModalWrapper from "../../ui/CenteredModalWrapper";
import CollaboratorsListModalContent from "../../CollaboratorsListModalContent";

type Props = {
  id: string;
  name: string;
};

const Row = memo((props: Props) => {
  const { name, id } = props;

  const [isOpenModal, setIsOpenModal] = useState(false);

  return (
    <>
      <div
        className={styles.container}
        onClick={() => {
          setIsOpenModal(true);
        }}
      >
        {name}
      </div>
      <CenteredModalWrapper
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
      >
        <CollaboratorsListModalContent
          onClose={() => setIsOpenModal(false)}
          subdivisionId={id}
          subdivisionName={name}
        />
      </CenteredModalWrapper>
    </>
  );
});

export default Row;
