import styles from "./style.module.css";
import Loader from "../../ui/Loader";
import SubdivisionRow from "../../SubdivisionRow";
import { useSubdivisionsFilteredList } from "../controller";
import type { Subdivision } from "../../../types";

const SubdivisionsFilteredListView = () => {
  const { query, handleInputChange, getState } = useSubdivisionsFilteredList();

  const model = getState();

  const subdivisionsList = model.subdivisions;
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

      {renderContent(subdivisionsList, error, isLoading)}
    </div>
  );
};

// выбор отображаемого ReactNode в зависимости от количества элементов в массиве и наличия ошибоки.
function renderContent(
  data: Subdivision[],
  error: string | null,
  isLoading: boolean
) {
  if (error) return <p className={styles.message}>Ошибка в получении данных</p>;
  if (data.length === 0 && !isLoading)
    return <p className={styles.message}>Ничего не найдено</p>;
  return (
    <div className={styles.list}>
      {data.map((item) => (
        <SubdivisionRow name={item.name} id={item.id} key={item.id} />
      ))}
    </div>
  );
}

export default SubdivisionsFilteredListView;
