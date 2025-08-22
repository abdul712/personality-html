var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.js
var src_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    try {
      if (url.pathname.startsWith("/api/")) {
        return handleAPI(request, env);
      }
      return new Response("Not Found", { status: 404 });
    } catch (e) {
      console.error("Worker error:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  }
};
async function handleAPI(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  switch (path) {
    case "/api/health":
      return new Response(JSON.stringify({
        status: "OK",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        worker: "personality-spark",
        environment: env.ENVIRONMENT || "development"
      }), {
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    case "/api/quizzes/types":
      return new Response(JSON.stringify({
        success: true,
        quizTypes: [
          {
            id: "big5",
            name: "Big 5 Personality",
            duration: "10-15 min",
            questions: 30,
            description: "Discover your openness, conscientiousness, extraversion, agreeableness, and neuroticism levels.",
            popular: true
          },
          {
            id: "daily",
            name: "Daily Challenge",
            duration: "3-5 min",
            questions: 10,
            description: "Quick daily quiz that explores different aspects of your personality each day.",
            daily: true
          },
          {
            id: "quick",
            name: "Quick Assessment",
            duration: "2 min",
            questions: 5,
            description: "Get instant personality insights with our rapid-fire 5-question assessment.",
            quick: true
          },
          {
            id: "thisorthat",
            name: "This or That",
            duration: "5 min",
            questions: 15,
            description: "Make quick choices between options to reveal your personality preferences and traits."
          },
          {
            id: "mood",
            name: "Mood-Based Test",
            duration: "7 min",
            questions: 20,
            description: "Explore how your current mood influences your personality expression and decision-making."
          },
          {
            id: "career",
            name: "Career Match",
            duration: "12 min",
            questions: 25,
            description: "Discover which career paths align best with your personality traits and work style."
          }
        ]
      }), {
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    case "/api/quizzes/generate":
      if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
          status: 405,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
      try {
        const body = await request.json();
        const { quizType, difficulty = "medium" } = body;
        return new Response(JSON.stringify({
          success: true,
          quiz: {
            id: `quiz_${Date.now()}`,
            type: quizType,
            title: `Personality Quiz - ${quizType}`,
            questions: generateMockQuestions(quizType),
            estimatedTime: getEstimatedTime(quizType)
          }
        }), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
    default:
      return new Response(JSON.stringify({
        error: "API endpoint not found",
        availableEndpoints: ["/api/health", "/api/quizzes/types", "/api/quizzes/generate"]
      }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
  }
}
__name(handleAPI, "handleAPI");
function generateMockQuestions(quizType) {
  const baseQuestions = [
    {
      id: 1,
      text: "I enjoy meeting new people and socializing",
      options: [
        { text: "Strongly Agree", value: 5 },
        { text: "Agree", value: 4 },
        { text: "Neutral", value: 3 },
        { text: "Disagree", value: 2 },
        { text: "Strongly Disagree", value: 1 }
      ]
    },
    {
      id: 2,
      text: "I prefer to plan things in advance rather than be spontaneous",
      options: [
        { text: "Always", value: 5 },
        { text: "Often", value: 4 },
        { text: "Sometimes", value: 3 },
        { text: "Rarely", value: 2 },
        { text: "Never", value: 1 }
      ]
    },
    {
      id: 3,
      text: "I am comfortable with taking risks",
      options: [
        { text: "Very comfortable", value: 5 },
        { text: "Comfortable", value: 4 },
        { text: "Neutral", value: 3 },
        { text: "Uncomfortable", value: 2 },
        { text: "Very uncomfortable", value: 1 }
      ]
    }
  ];
  const questionCounts = {
    "big5": 30,
    "daily": 10,
    "quick": 5,
    "thisorthat": 15,
    "mood": 20,
    "career": 25
  };
  const count = questionCounts[quizType] || 10;
  return baseQuestions.slice(0, Math.min(count, baseQuestions.length));
}
__name(generateMockQuestions, "generateMockQuestions");
function getEstimatedTime(quizType) {
  const times = {
    "big5": "10-15 min",
    "daily": "3-5 min",
    "quick": "2 min",
    "thisorthat": "5 min",
    "mood": "7 min",
    "career": "12 min"
  };
  return times[quizType] || "5 min";
}
__name(getEstimatedTime, "getEstimatedTime");

// ../../.npm-global/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../.npm-global/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-QbsjTU/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../.npm-global/lib/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-QbsjTU/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
