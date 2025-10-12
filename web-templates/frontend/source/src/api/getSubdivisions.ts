import { BACKEND_URL } from "../config/global";
import type { Subdivision } from "../types";
import type { TypeDTO } from "./type";

//тип данных приходящих с сервера

export const getSubdivisions = async (
  query: string
): Promise<Subdivision[]> => {
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

  const data: TypeDTO<Subdivision> = await response.json();

  if (!data.success) {
    throw new Error(data.error.message);
  }

  return data.data;
};
