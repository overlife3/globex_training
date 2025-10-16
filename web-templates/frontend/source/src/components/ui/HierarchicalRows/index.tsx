import styles from "./style.module.css";
import TreeNode from "./TreeNode";
import type { HierarchicalItem, RenderRowContentFunc } from "./types";

type Props = {
  data: HierarchicalItem[];
  renderRowContent: RenderRowContentFunc;
};

const HierarchicalRows = (props: Props) => {
  const { data, renderRowContent } = props;
  const rootItems = data.filter((item) => item.level === 0);

  return (
    <div className={styles.container}>
      <div className={styles.tree}>
        {rootItems.map((item) => (
          <TreeNode
            key={item.id}
            item={item}
            data={data}
            renderRowContent={renderRowContent}
          />
        ))}
      </div>
    </div>
  );
};

export default HierarchicalRows;
