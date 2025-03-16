import { API_BASE_URL } from "./constants";
import { routes } from "./data/api-routes";
import { Country } from "./types";

type Route = (typeof routes)[number];
export type ConstructAPI = {
  route?: Route;
  query?: string;
  fields: readonly (keyof Country)[] | undefined;
  status?: boolean;
  codes?: string;
  fullText?: boolean;
};

export function constructAPI({ route = "all", query = "", fields, status, codes, fullText }: ConstructAPI) {
  const base_url = new URL(API_BASE_URL);
  if (status !== undefined) route = "independent";

  base_url.pathname += `/${route}` + `/${query.toLowerCase()}`;
  if (status !== undefined) base_url.searchParams.set("status", String(status));
  if (fullText !== undefined) base_url.searchParams.set("fullText", String(fullText));
  if (codes) base_url.searchParams.append("codes", codes.toLowerCase());
  fields = Array.from(new Set(fields));
  if (fields && fields.length) base_url.searchParams.set("fields", fields.join(","));
  return base_url;
}

export function handleNotFoundError(ok: boolean) {
  if (!ok)
    console.log("Couldn't find any country that matches your query, if you think it is issue please submit it via github issues");
}

export function handleNetworkError(error: any) {
  console.warn("A network or REST Countries API side error happened while fetching data. Try again later.");
  console.warn(
    "If this error persists, please verify the status of the REST Countries API. If the issue continues, feel free to report it on GitHub: https://github.com/yusifaliyevpro/countries"
  );
  console.error(error);
}
