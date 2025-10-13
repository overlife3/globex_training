import { useState } from "react";
import CollaboratorsListModal from "../CollaboratorsListModal";
import styles from "./style.module.css";

type Props = {
  id: number;
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
