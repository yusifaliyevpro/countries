import type { Country } from "@yusifaliyevpro/countries";
import { rc } from "./client";

/**
 * Every country with all properties, assembled by paging through the API.
 *
 * There's no caching here anymore — the client (tests/client.ts) caches each
 * page response to disk, so a warm run resolves this whole loop offline.
 */
export async function loadAllCountries(): Promise<Country[]> {
  const all: Country[] = [];
  let offset = 0;
  for (;;) {
    const page = await rc.getCountries({ limit: 300, offset });
    if (!page.success) throw page.error;
    all.push(...page.countries);
    if (!page.meta.more) break;
    offset += page.meta.limit;
  }
  return all;
}
