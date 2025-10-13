import { BACKEND_URL } from "../config/global";
import type { Collaborator } from "../types";
import type { TypeDTO } from "./type";

export const getCollaborators = async (
  subdivisionId: number
): Promise<Collaborator[]> => {
  const response = await fetch(`${BACKEND_URL}`, {
    method: "POST",
    body: JSON.stringify({
      method: "getCollaboratorsBySubdivisionId",
      subdivisionId,
    }),
  });
  console.log(subdivisionId);
  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data: TypeDTO<Collaborator> = await response.json();

  if (!data.success) {
    throw new Error(data.error.message);
  }

  return data.data;
};
