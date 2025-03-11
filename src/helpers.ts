import { API_BASE_URL } from "./constants";
import { Country } from "./types";

export type ConstructAPI = {
  route?: string;
  query?: string;
  fields: (keyof Country)[] | undefined;
  status?: boolean;
  codes?: string;
};

export function constructAPI({ route = "all", query = "", fields, status, codes }: ConstructAPI) {
  const base_url = new URL(API_BASE_URL);
  if (status !== undefined) route = "independent";

  base_url.pathname += `/${route}` + `/${query.toLowerCase()}`;
  if (status !== undefined) base_url.searchParams.set("status", String(status));
  if (codes) base_url.searchParams.append("codes", codes.toLowerCase());
  if (fields && !!fields.length) base_url.searchParams.set("fields", fields.join(","));
  return base_url;
}
