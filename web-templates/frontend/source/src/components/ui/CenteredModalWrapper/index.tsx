import React, { useRef } from "react";
import ReactDOM from "react-dom";
import styles from "./style.module.css";
import { useLockBodyScroll, useOutsideClick } from "../../../hooks";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const CenteredModalWrapper = ({ isOpen, onClose, children }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  useOutsideClick(modalRef, onClose);

  useLockBodyScroll(isOpen);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className={styles.centered_modal}>
      <div className={styles.modal_content} ref={modalRef}>
        {children}
      </div>
    </div>,
    document.getElementById("modal-root")!
  );
};

export default CenteredModalWrapper;
