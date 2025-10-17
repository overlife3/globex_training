import styles from "./style.module.css";
import { useFilteredList } from "../controller";
import type { GetRemoteDataFunc } from "../controller";
import Loader from "../../ui/Loader";
import type { Collaborator } from "../../../types";
import SubdivisionsDropdown from "../../SubdivisionsDropdown";
import { useLayoutEffect, useMemo } from "react";
import Tooltip from "../../ui/Tooltip";

type RenderListFunc = (data: Collaborator[]) => React.ReactNode;

type Props = {
  isSubscription: boolean;
  renderList: RenderListFunc;
  renderEmpty: () => React.ReactNode;
  getRemoteData: GetRemoteDataFunc;
};

function FilteredListByQueryView(props: Props) {
  const { getRemoteData, renderList, renderEmpty, isSubscription } = props;
  const {
    rule,
    handleInputChange,
    getState,
    handleParentIdChange,
    handleIsSubscriptionChange,
  } = useFilteredList(getRemoteData);

  const model = getState();

  const data = model.data;
  const isLoading = model.isLoading;
  const error = model.error;

  useLayoutEffect(() => {
    handleIsSubscriptionChange(isSubscription);
  }, []);

  const content = useMemo(
    () => renderContent(renderList, renderEmpty, data, error, isLoading),
    [error, data, isLoading, renderList, renderEmpty]
  );

  return (
    <div>
      <div className={styles.input_container}>
        <input
          placeholder="Поиск по ФИО"
          value={rule.query}
          onChange={(e) => handleInputChange(e.target.value)}
        />

        <Tooltip content="Выберите подразделение" placement="bottom">
          <SubdivisionsDropdown
            onSelect={(option) =>
              handleParentIdChange(option ? option.id : null)
            }
          />
        </Tooltip>
        <div className={styles.loader_container}>{isLoading && <Loader />}</div>
      </div>

      {content}
    </div>
  );
}

// выбор отображаемого ReactNode в зависимости от количества элементов в массиве и наличия ошибоки.
function renderContent(
  renderList: RenderListFunc,
  renderEmpty: () => React.ReactNode,
  data: Collaborator[],
  error: string | null,
  isLoading: boolean
) {
  if (error) return <p className={styles.message}>Ошибка в получении данных</p>;
  if (data.length === 0 && !isLoading) return renderEmpty();
  return renderList(data);
}

export default FilteredListByQueryView;
