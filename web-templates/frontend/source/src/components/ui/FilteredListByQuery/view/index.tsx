import styles from "./style.module.css";
import { useFilteredListByQuery } from "../controller";
import type { GetRemoteDataFunc } from "../controller";
import Loader from "../../Loader";

type RenderListFunc<T> = (data: T[]) => React.ReactNode;

type Props<T> = {
  renderList: RenderListFunc<T>;
  renderEmpty: () => React.ReactNode;
  getRemoteData: GetRemoteDataFunc<T>;
};

function FilteredListByQueryView<T>(props: Props<T>) {
  const { getRemoteData, renderList, renderEmpty } = props;
  const { query, handleInputChange, getState } =
    useFilteredListByQuery(getRemoteData);

  const model = getState();

  const data = model.data;
  const isLoading = model.isLoading;
  const error = model.error;

  return (
    <div>
      <div className={styles.input_container}>
        <input
          placeholder="Поиск по ФИО"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
        />

        <div className={styles.loader_container}>{isLoading && <Loader />}</div>
      </div>

      {renderContent(renderList, renderEmpty, data, error, isLoading)}
    </div>
  );
}

function renderContent<T>(
  renderList: RenderListFunc<T>,
  renderEmpty: () => React.ReactNode,
  data: T[],
  error: string | null,
  isLoading: boolean
) {
  if (error) return <p className={styles.message}>Ошибка в получении данных</p>;
  if (data.length === 0 && !isLoading) return renderEmpty();
  return renderList(data);
}

export default FilteredListByQueryView;
