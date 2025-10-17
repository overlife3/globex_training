import { getSubdivisionsByQuery } from "../../api/getSubdivisionsByQuery";
import { FilteredListByQuery } from "../ui/FilteredListByQuery";
import HierarchicalRows from "../ui/HierarchicalRows";
import Row from "./Row";

const SubdivisionsFilteredList = () => {
  return (
    <FilteredListByQuery
      getRemoteData={getSubdivisionsByQuery}
      renderList={(data) => {
        return (
          <HierarchicalRows
            data={data.map((item) => ({
              id: item.id,
              label: item.name,
              parentId: item.parent_object_id,
              level: item.level,
            }))}
            renderRowContent={(item) => <Row id={item.id} name={item.label} />}
          />
        );
      }}
      renderEmpty={() => <p>Список пуст</p>}
    />
  );
};

export default SubdivisionsFilteredList;
