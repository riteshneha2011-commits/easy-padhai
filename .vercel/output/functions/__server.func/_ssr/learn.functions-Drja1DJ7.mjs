import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BpbeoxIM.mjs";
import { n as createSsrRpc } from "./utils-wh7lFpBf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/learn.functions-Drja1DJ7.js
var getDashboard = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("9cb9ae5ce92ce50a73bc48e0456eb4b9fef03e04843d484d2e0976264e403e4e"));
var completeLesson = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("b80c5efbae4df90eeece43e59af969207aa81c3e08078356ad83e3fdf8a8f692"));
var getChapterProgress = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("9fd1a302390aef9879bc23178265ece6d4b578795aa07b37a2a29461fabd08da"));
//#endregion
export { getChapterProgress as n, getDashboard as r, completeLesson as t };
