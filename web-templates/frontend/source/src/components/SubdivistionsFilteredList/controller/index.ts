import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "../../../hooks";
import { SubdivisionsFilteredListModel } from "../model";
import { getSubdivisions } from "../../../api/getSubdivisions";

// контроллер архитектурного паттерна MVC
// здесь находится вся логика взаимодействия данных и отображения
export const useSubdivisionsFilteredList = () => {
  const [model] = useState(new SubdivisionsFilteredListModel());
  const [, setRerender] = useState({});

  // состояние приложения хранится не в React State, а в экземпляре класса CollaboratorsFilteredListModel
  // поэтому необходимо искусственно вызывать перерендер для отображения нового состояния компонента
  // именно это и делает функция update
  const update = () => setRerender({});
  const query = model.getQuery();

  // функция loadCollaborators - для изменения состояния при выполнении запроса
  const loadSubdivisions = useCallback(async (query: string) => {
    try {
      model.setIsLoading(true);
      update();
      const data = await getSubdivisions(query);
      model.setSubdivisions(data);
      model.setIsLoading(false);
      update();
    } catch (err) {
      if (err instanceof Error) {
        model.setError(err.message);
        model.setSubdivisions([]);
        model.setIsLoading(false);
        console.error(err);
        update();
      } else console.error(err);
    }
  }, []);

  const changeQuery = (value: string) => {
    model.setQuery(value);
    update();
  };

  const debouncedLoadCollaborators = useDebounce(loadSubdivisions, 300);

  const handleInputChange = (value: string) => {
    changeQuery(value);
    debouncedLoadCollaborators(value);
  };

  useEffect(() => {
    loadSubdivisions("");
  }, []);

  return {
    getState: () => model.getState(),
    query,
    handleInputChange,
  };
};
