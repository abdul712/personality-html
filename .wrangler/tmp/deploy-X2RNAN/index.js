var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.js
var index_default = {
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
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
