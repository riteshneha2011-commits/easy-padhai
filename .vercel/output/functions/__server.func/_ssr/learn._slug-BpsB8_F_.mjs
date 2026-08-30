import { N as notFound, m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as DEFAULT_CLASS_LEVEL, s as classLabel } from "./classes-DRcecDr1.mjs";
import { n as getChapter } from "./content.functions-DdxEIDJE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/learn._slug-BpsB8_F_.js
var $$splitComponentImporter = () => import("./learn._slug-D-u_TG3J.mjs");
var Route = createFileRoute("/learn/$slug")({
	loader: async ({ params }) => {
		const data = await getChapter({ data: { slug: params.slug } });
		if (!data) throw notFound();
		return data;
	},
	head: ({ loaderData }) => {
		if (!loaderData) return { meta: [{ title: "Chapter not found — Easy Padhai" }, {
			name: "robots",
			content: "noindex"
		}] };
		const chapterClass = loaderData.chapter.subjects?.class_level;
		const title = `${loaderData.chapter.title} — Easy Padhai ${classLabel(chapterClass ?? DEFAULT_CLASS_LEVEL)}`;
		const description = loaderData.chapter.description ?? `Audio, video, summary, notes and a test for ${loaderData.chapter.title}.`;
		return { meta: [
			{ title },
			{
				name: "description",
				content: description
			},
			{
				property: "og:title",
				content: title
			},
			{
				property: "og:description",
				content: description
			}
		] };
	},
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
