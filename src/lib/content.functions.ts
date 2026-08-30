import { createServerFn } from "@tanstack/react-start";
import { fetchCatalog, fetchChapterBySlug, fetchLeaderboard } from "./content.server";

export const getCatalog = createServerFn({ method: "GET" }).handler(async () => fetchCatalog());

export const getChapter = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => fetchChapterBySlug(data.slug));

export const getLeaderboard = createServerFn({ method: "GET" }).handler(async () =>
  fetchLeaderboard(),
);
