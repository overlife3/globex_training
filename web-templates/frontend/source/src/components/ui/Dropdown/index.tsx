import { useRef, useState } from "react";
import {
  useFloating,
  useInteractions,
  useClick,
  useDismiss,
  useRole,
  FloatingFocusManager,
} from "@floating-ui/react";
import styles from "./style.module.css";
import clsx from "clsx";
import Loader from "../Loader";

type Option = {
  label: string;
  id: string;
};

interface Props {
  options: Option[];
  onSelect: (option: Option | null) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  isError?: boolean;
}

const Dropdown = ({
  options,
  onSelect,
  placeholder = "Выберите вариант",
  disabled = false,
  isLoading,
  isError,
}: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const activeOption = useRef<Option | null>(null);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const handleSelect = (option: Option | null) => {
    activeOption.current = option;
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <>
      <button
        className={styles.button}
        ref={refs.setReference}
        {...getReferenceProps()}
        disabled={disabled}
        type="button"
      >
        {activeOption.current?.label || placeholder}
        <span className={styles.label}>▼</span>
      </button>

      {isOpen && (
        <FloatingFocusManager context={context} modal={false}>
          {isLoading ? (
            <Loader />
          ) : (
            <div
              className={styles.dropdown}
              ref={refs.setFloating}
              style={{
                ...floatingStyles,
              }}
              {...getFloatingProps()}
            >
              {isError ? (
                <p>Произошла ошибка</p>
              ) : (
                <>
                  <button
                    className={clsx(styles.option)}
                    onClick={() => handleSelect(null)}
                  >
                    Нет
                  </button>
                  {options.map((option) => (
                    <button
                      className={clsx(styles.option)}
                      key={option.id}
                      onClick={() => handleSelect(option)}
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </FloatingFocusManager>
      )}
    </>
  );
};

export default Dropdown;
