import { useState } from "react";
import type { HierarchicalItem, RenderRowContentFunc } from "../types";
import styles from "./style.module.css";
import clsx from "clsx";

type Props = {
  item: HierarchicalItem;
  data: HierarchicalItem[];
  level?: number;
  renderRowContent: RenderRowContentFunc;
};

const TreeNode = (props: Props) => {
  const { item, data, renderRowContent, level = 0 } = props;

  const [isExpanded, setIsExpanded] = useState(false);

  const children = data.filter((child) => child.parentId === item.id);
  const hasChildren = children.length > 0;

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.row} style={{ paddingLeft: `${level * 20}px` }}>
        <div className={styles.content_container}>{renderRowContent(item)}</div>
        <div className={styles.expand_btn} onClick={handleClick}>
          {hasChildren && (
            <span
              className={clsx(styles.expand_btn_icon, {
                [styles.is_expanded]: isExpanded,
              })}
            >
              ▼
            </span>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className={styles.children}>
          {children.map((child) => (
            <TreeNode
              key={child.id}
              item={child}
              data={data}
              level={level + 1}
              renderRowContent={renderRowContent}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode;
