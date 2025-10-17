import { BACKEND_URL } from "../config/global";
import type { SubdivisionWithHierarchical } from "../types";
import type { TypeDTO } from "./type";

export const getSubdivisionsByQuery = async (
  query: string
): Promise<SubdivisionWithHierarchical[]> => {
  const response = await fetch(`${BACKEND_URL}`, {
    method: "POST",
    body: JSON.stringify({
      query,
      method: "getSubdivisionsByQuery",
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data: TypeDTO<SubdivisionWithHierarchical[]> = await response.json();

  if (!data.success) {
    throw new Error(data.error.message);
  }

  const dataFiltered = data.data.filter((item_1, _, arr) => {
    const maxLevel = Math.max(
      ...arr
        .filter((item_2) => item_1.name === item_2.name)
        .map((item_2) => item_2.level)
    );

    return item_1.level === maxLevel;
  });

  return dataFiltered;
};
