import { type ReactNode, useState } from "react";
import {
  useFloating,
  useHover,
  useFocus,
  useInteractions,
  offset,
  shift,
  flip,
  autoUpdate,
  type Placement,
} from "@floating-ui/react";

import styles from "./style.module.css";

interface Props {
  children: ReactNode;
  content: ReactNode;
  placement?: Placement;
  delay?: number;
  disabled?: boolean;
  className?: string;
}

const Tooltip = ({
  children,
  content,
  placement = "top",
  delay = 200,
  disabled = false,
  className = "",
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });

  const hover = useHover(context, { delay });
  const focus = useFocus(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
  ]);

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        ref={refs.setReference}
        {...getReferenceProps()}
        className={styles.trigger}
      >
        {children}
      </div>

      {isOpen && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
          className={`${styles.tooltip} ${className}`}
        >
          {content}
        </div>
      )}
    </>
  );
};

export default Tooltip;
