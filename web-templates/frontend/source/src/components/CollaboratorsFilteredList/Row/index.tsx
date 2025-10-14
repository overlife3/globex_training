import { useState } from "react";
import CollaboratorDataModal from "../../CollaboratorDataModal";
import styles from "./style.module.css";
type Props = {
  collaboratorId: string;
  fullname: string;
};

const Row = (props: Props) => {
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
      <CollaboratorDataModal
        collaboratorFullname={fullname}
        collaboratorId={collaboratorId}
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
      />
    </>
  );
};

export default Row;
