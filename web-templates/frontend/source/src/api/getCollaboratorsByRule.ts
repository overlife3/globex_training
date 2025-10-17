import { BACKEND_URL } from "../config/global";
import type { Collaborator } from "../types";
import type { TypeDTO } from "./type";

type Rule = {
  query?: string;
  position_parent_id?: string;
  is_subscription: boolean;
};

export const getCollaboratorsByRule = async (
  rule: Rule
): Promise<Collaborator[]> => {
  const response = await fetch(`${BACKEND_URL}`, {
    method: "POST",
    body: JSON.stringify({
      rule: rule,
      method: "getCollaboratorsByRule",
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data: TypeDTO<Collaborator[]> = await response.json();

  if (!data.success) {
    throw new Error(data.error.message);
  }

  return data.data;
};
