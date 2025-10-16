import React, { useEffect, useState } from "react";
import Loader from "../Loader";
import styles from "./style.module.css";

type Props = {
  children: string;
  onAction: () => Promise<unknown>;
  disableAfterSuccess?: boolean;
};

type State = {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
};
const initialState: State = {
  isLoading: false,
  isError: false,
  isSuccess: false,
};

const ActionButton = (props: Props) => {
  const { onAction, children, disableAfterSuccess } = props;

  const [state, setState] = useState<State>(initialState);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    if (state.isSuccess && disableAfterSuccess) {
      setDisabled(true);
    }
  }, [state.isSuccess, disableAfterSuccess]);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = async (
    event
  ) => {
    event.stopPropagation();
    try {
      setState(initialState);
      setState((prev) => ({ ...prev, isLoading: true }));
      await onAction();
      setState((prev) => ({ ...prev, isSuccess: true }));
    } catch (e) {
      setState((prev) => ({ ...prev, isError: true }));
      console.error(e);
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };
  return (
    <button className={styles.button} onClick={handleClick} disabled={disabled}>
      <span className={styles.label}>{children}</span>
      <div className={styles.state}>
        {state.isLoading && <Loader size="small" />}
        {state.isSuccess && <span className={styles.success}>✔</span>}
      </div>
    </button>
  );
};

export default ActionButton;
