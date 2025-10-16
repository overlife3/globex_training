import { BACKEND_URL } from "../config/global";
import type { TypeDTO } from "./type";

export const deleteSubscribeCurUserToCollaborator = async (
  collaboratorId: string
): Promise<void> => {
  const response = await fetch(`${BACKEND_URL}`, {
    method: "POST",
    body: JSON.stringify({
      collaboratorId,
      method: "deleteSubscribeCurUserToCollaborator",
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data: TypeDTO<void> = await response.json();

  if (!data.success) {
    throw new Error(data.error.message);
  }
};
