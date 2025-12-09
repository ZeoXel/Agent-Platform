import { Annotation, MessagesAnnotation, StateGraph, START, END } from "@langchain/langgraph";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ToolMessage } from "@langchain/core/messages";
import { LANGCHAIN_TOOLS } from "@/lib/agent/tools/langchainTools";
import { TOOL_NAMES, AGENT_CONFIG } from "@/lib/agent/config";

const toolMap = new Map(LANGCHAIN_TOOLS.map((tool) => [tool.name, tool]));

const ArtifactReducer = {
  reducer: (left, right) => {
    const incoming = Array.isArray(right) ? right : right ? [right] : [];
    if (!incoming.length) return left;
    return [...left, ...incoming];
  },
  default: () => [],
};

export const AgentAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  artifacts: Annotation(ArtifactReducer),
  timeline: Annotation(ArtifactReducer),
  lastImages: Annotation({ default: () => [] }),
});

const DEFAULT_MODEL = process.env.AGENT_MODEL_NAME || "gpt-4o-mini";

function createModel() {
  return new ChatOpenAI({
    modelName: DEFAULT_MODEL,
    temperature: 0,
    streaming: false,
  }).bindTools(LANGCHAIN_TOOLS, {
    parallel_tool_calls: false,
  });
}

function latestToolCalls(message) {
  if (!message) return [];
  if (message.tool_calls && message.tool_calls.length) return message.tool_calls;
  const fromKwargs = message.additional_kwargs?.tool_calls;
  return fromKwargs && fromKwargs.length ? fromKwargs : [];
}

const toolLabel = (name) => {
  if (name === TOOL_NAMES.EDIT_IMAGE) return "editing";
  if (name === TOOL_NAMES.GENERATE_IMAGE) return "generating";
  return name;
};

function buildGraph() {
  const model = createModel();

  const callModel = async (state) => {
    const response = await model.invoke(state.messages, {
      configurable: { lastImages: state.lastImages },
    });
    const toolCalls = latestToolCalls(response);
    const status = toolCalls.length ? "thinking" : "responding";
    const timeline = status ? [{ type: "status", status }] : [];
    return {
      messages: [response],
      timeline,
    };
  };

  const callTools = async (state) => {
    const last = state.messages[state.messages.length - 1];
    const toolCalls = latestToolCalls(last);
    if (!toolCalls.length) {
      return { timeline: [{ type: "status", status: "idle" }] };
    }

    const toolMessages = [];
    const artifactBatch = [];
    let lastImages = state.lastImages || [];
    const timeline = [];

    for (const call of toolCalls) {
      const tool = toolMap.get(call.name);
      if (!tool) continue;
      let args = call.args ?? {};
      if (typeof args === "string") {
        try {
          args = JSON.parse(args);
        } catch (err) {
          args = {};
        }
      }
      const result = await tool.invoke(args, {
        configurable: { lastImages },
      });
      toolMessages.push(
        new ToolMessage({
          content: JSON.stringify(result),
          tool_call_id: call.id,
        })
      );

      timeline.push({ type: "status", status: toolLabel(call.name) });

      if (result?.images?.length) {
        const normalized = result.images
          .filter(Boolean)
          .map((img, index) => ({
            type: "image",
            url: typeof img === "string" ? img : img.url,
            origin: call.name,
            index,
            createdAt: Date.now(),
          }));
        if (normalized.length) {
          artifactBatch.push(...normalized);
          lastImages = normalized.map((item) => item.url);
          timeline.push({ type: "images", images: normalized });
        }
      }
    }

    return {
      messages: toolMessages,
      artifacts: artifactBatch,
      lastImages,
      timeline,
    };
  };

  const shouldContinue = (state) => {
    const last = state.messages[state.messages.length - 1];
    const toolCalls = latestToolCalls(last);
    if (toolCalls.length) {
      return "call_tools";
    }
    return END;
  };

  const workflow = new StateGraph(AgentAnnotation)
    .addNode("call_model", callModel)
    .addNode("call_tools", callTools)
    .addEdge(START, "call_model")
    .addConditionalEdges("call_model", shouldContinue, ["call_tools", END])
    .addEdge("call_tools", "call_model");

  return workflow.compile();
}

let compiledGraph;

export function getAgentGraph() {
  if (!compiledGraph) {
    compiledGraph = buildGraph();
  }
  return compiledGraph;
}

export function buildInitialState({
  baseMessages,
  artifacts = [],
  lastImages = [],
}) {
  return {
    messages: baseMessages,
    artifacts,
    timeline: [],
    lastImages,
  };
}

export const SYSTEM_MESSAGE = AGENT_CONFIG.systemPrompt;
