import { BACKEND_URL } from "../config/global";
import type { CollaboratorData } from "../types";
import type { TypeDTO } from "./type";

export const getCollaboratorData = async (
  collaboratorId: string
): Promise<CollaboratorData> => {
  const response = await fetch(`${BACKEND_URL}`, {
    method: "POST",
    body: JSON.stringify({
      method: "getCollaboratorData",
      collaboratorId,
    }),
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data: TypeDTO<CollaboratorData> = await response.json();

  if (!data.success) {
    throw new Error(data.error.message);
  }

  return data.data;
};
