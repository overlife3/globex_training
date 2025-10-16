import { useEffect, useState } from "react";
import type { Subdivision } from "../../types";
import { getSubdivisionsByQuery } from "../../api/getSubdivisionsByQuery";
import Dropdown from "../ui/Dropdown";

type Props = {
  onSelect: (item: { id: string } | null) => void;
};

type State = {
  data: Subdivision[];
  isLoading: boolean;
  isError: boolean;
};

const initialState: State = {
  data: [],
  isLoading: false,
  isError: false,
};

const SubdivisionsDropdown = (props: Props) => {
  const { onSelect } = props;
  const [state, setState] = useState<State>(initialState);

  useEffect(() => {
    async function loadData() {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));
        const data = await getSubdivisionsByQuery("");
        setState((prev) => ({ ...prev, data }));
      } catch (e) {
        console.error(e);
        alert("Произошла ошибка при получении подразделений");
        setState((prev) => ({ ...prev, isError: true }));
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    }

    loadData();
  }, []);

  const handleSelect = (option: { id: string } | null) => {
    onSelect(option);
  };

  return (
    <Dropdown
      options={state.data.map((item) => ({ id: item.id, label: item.name }))}
      onSelect={handleSelect}
      isLoading={state.isLoading}
      placeholder="Подразделение"
    />
  );
};

export default SubdivisionsDropdown;
