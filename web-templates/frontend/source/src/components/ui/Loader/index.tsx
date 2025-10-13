import clsx from "clsx";
import styles from "./style.module.css";

type Props = {
  size?: "small" | "medium" | "large";
};

const Loader = (props: Props) => {
  const { size } = props;
  return (
    <div
      className={clsx(styles.loader, {
        [styles.small]: size === "small",
        [styles.medium]: size === "medium",
        [styles.large]: size === "large",
      })}
    ></div>
  );
};

export default Loader;
