import { n as queryOptions } from "../_libs/tanstack__react-query.mjs";
import { t as getCatalog } from "./content.functions-DdxEIDJE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/learn.index-C3L-LwJN.js
var catalogQuery = queryOptions({
	queryKey: ["catalog"],
	queryFn: () => getCatalog()
});
//#endregion
export { catalogQuery as t };
