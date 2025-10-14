import styles from "./style.module.css";
import { useFilteredList } from "../controller";
import type { GetRemoteDataFunc } from "../controller";
import Loader from "../../Loader";

type RenderListFunc<T> = (data: T[]) => React.ReactNode;

type Props<T> = {
  renderList: RenderListFunc<T>;
  getRemoteData: GetRemoteDataFunc<T>;
};

function FilteredListView<T>(props: Props<T>) {
  const { getRemoteData, renderList } = props;
  const { query, handleInputChange, getState } = useFilteredList(getRemoteData);

  const model = getState();

  const data = model.data;
  const isLoading = model.isLoading;
  const error = model.error;

  return (
    <div>
      <div className={styles.input_container}>
        <input
          placeholder="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
        />
        <div className={styles.loader_container}>{isLoading && <Loader />}</div>
      </div>

      {renderContent(renderList, data, error, isLoading)}
    </div>
  );
}

// выбор отображаемого ReactNode в зависимости от количества элементов в массиве и наличия ошибоки.
function renderContent<T>(
  renderList: RenderListFunc<T>,
  data: T[],
  error: string | null,
  isLoading: boolean
) {
  if (error) return <p className={styles.message}>Ошибка в получении данных</p>;
  if (data.length === 0 && !isLoading)
    return <p className={styles.message}>Ничего не найдено</p>;
  return renderList(data);
}

export default FilteredListView;
