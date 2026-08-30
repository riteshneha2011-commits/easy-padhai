import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { n as createSsrRpc } from "./utils-wh7lFpBf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/content.functions-DdxEIDJE.js
var getCatalog = createServerFn({ method: "GET" }).handler(createSsrRpc("46aac1f11d35abcb50ed01044fe086e3f41abf4ae09328c04cd9ce4b3e8917bb"));
var getChapter = createServerFn({ method: "GET" }).inputValidator((data) => data).handler(createSsrRpc("c4ed8a3962a2517773763a28fcd4229778116573910aa43e6d1bffbde1aed780"));
var getLeaderboard = createServerFn({ method: "GET" }).handler(createSsrRpc("693c6fc4cb66ad25679ca077ca0fcc5f067866b2606c0a66d2f0666a50710c3e"));
//#endregion
export { getChapter as n, getLeaderboard as r, getCatalog as t };
