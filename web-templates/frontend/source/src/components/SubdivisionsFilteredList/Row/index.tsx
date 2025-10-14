import { useState } from "react";
import styles from "./style.module.css";
import CollaboratorsListModal from "../../CollaboratorsListModal";

type Props = {
  id: string;
  name: string;
};

const SubdivisionRow = (props: Props) => {
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

      <CollaboratorsListModal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        subdivisionId={id}
        subdivisionName={name}
      />
    </>
  );
};

export default SubdivisionRow;
