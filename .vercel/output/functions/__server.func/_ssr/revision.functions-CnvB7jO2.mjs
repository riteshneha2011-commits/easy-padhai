import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BpbeoxIM.mjs";
import { n as createSsrRpc } from "./utils-wh7lFpBf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/revision.functions-CnvB7jO2.js
var listRevision = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("b905c4d162bfa5c076aa523cbcf64738b4f7519cbb6e0ec677f446847c46a741"));
var getRevisionCounts = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("25e4f4fa7e5146e722638af11c5fb64b927ead1b7785c643aee5ef1a4162cb8e"));
var toggleLessonBookmark = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("102463e909f6920c1318979b749594d710a97fadcf12f72ccf88fc82f767e171"));
var listLessonBookmarks = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("983d91ad56b574c12d1dbc026780900c96d85bdc45a7852488974952f061c7e9"));
var removeBookmark = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("78a1d9f5955259f954ec587c2b2e2313f04f3525ee664ac78b6bb77b741f0aa4"));
var saveQuestion = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("0d974a8d17fa051cfa43c4d6ddf20d0b583298a9651bfcd8f744fad6aa111c9e"));
var removeQuestionSave = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("3f56aa05b8d0383184c485aaa9f87fcf18da1e0d1a98227c1d7e3d8fc6dc2e2e"));
//#endregion
export { removeQuestionSave as a, removeBookmark as i, listLessonBookmarks as n, saveQuestion as o, listRevision as r, toggleLessonBookmark as s, getRevisionCounts as t };
