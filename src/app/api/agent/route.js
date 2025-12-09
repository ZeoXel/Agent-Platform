import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { getAgentGraph, buildInitialState, SYSTEM_MESSAGE } from "@/lib/agent/graph";

const sessionStates = new Map();

function getSessionState(sessionId) {
  if (!sessionStates.has(sessionId)) {
    sessionStates.set(sessionId, {
      lastImages: [],
      createdAt: Date.now(),
    });
  }
  return sessionStates.get(sessionId);
}

function cleanupSessions() {
  const now = Date.now();
  const ttl = 60 * 60 * 1000;
  for (const [sessionId, state] of sessionStates.entries()) {
    if (now - state.createdAt > ttl) {
      sessionStates.delete(sessionId);
    }
  }
}

setInterval(cleanupSessions, 10 * 60 * 1000);

const encoder = new TextEncoder();

function toBaseMessage(message) {
  if (!message) return null;
  const payload = {
    content: message.content,
    additional_kwargs: {},
  };

  if (message.attachments) {
    payload.additional_kwargs.attachments = message.attachments;
  }
  if (message.images) {
    payload.additional_kwargs.images = message.images;
  }

  if (message.role === "user") {
    return new HumanMessage(payload);
  }
  if (message.role === "assistant") {
    return new AIMessage(payload);
  }
  if (message.role === "system") {
    return new SystemMessage(payload);
  }
  return null;
}

function extractArtifactsFromMessage(message) {
  const artifacts = [];
  if (message.attachments?.length) {
    message.attachments.forEach((file, index) => {
      if (file?.url) {
        artifacts.push({
          type: "image",
          url: file.url,
          origin: "upload",
          name: file.name,
          index,
          createdAt: file.createdAt || Date.now(),
        });
      }
    });
  }
  if (message.images?.length) {
    message.images.forEach((img, index) => {
      const url = typeof img === "string" ? img : img.url;
      if (url) {
        artifacts.push({
          type: "image",
          url,
          origin: "assistant",
          index,
          createdAt: img.createdAt || Date.now(),
        });
      }
    });
  }
  return artifacts;
}

function collectMessages(clientMessages = []) {
  const baseMessages = [];
  const artifacts = [];

  for (const msg of clientMessages) {
    const converted = toBaseMessage(msg);
    if (converted) {
      baseMessages.push(converted);
    }
    const extras = extractArtifactsFromMessage(msg);
    if (extras.length) {
      artifacts.push(...extras);
    }
  }

  return { baseMessages, artifacts };
}

function formatContent(message) {
  if (!message) return "";
  const content = message.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part.type === "text") return part.text || "";
        return "";
      })
      .join("");
  }
  return "";
}

function sendEvent(controller, payload) {
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
}

function latestUserUploads(messages = []) {
  const lastUser = [...messages].reverse().find((msg) => msg.role === "user");
  if (!lastUser?.attachments?.length) return [];
  return lastUser.attachments.map((file) => file.url).filter(Boolean);
}

function dedupeImages(urls = []) {
  const seen = new Set();
  const ordered = [];
  urls.forEach((url) => {
    if (url && !seen.has(url)) {
      seen.add(url);
      ordered.push(url);
    }
  });
  return ordered;
}

function mapTimelineEvent(event) {
  if (!event?.type) return null;
  if (event.type === "status") {
    return { type: "status", status: event.status };
  }
  if (event.type === "images") {
    return {
      type: "images",
      images: event.images || [],
    };
  }
  return null;
}

export async function POST(request) {
  const agent = getAgentGraph();

  try {
    const body = await request.json();
    const clientMessages = Array.isArray(body.messages) ? body.messages : [];
    const sessionId = body.sessionId || "default";
    const sessionState = getSessionState(sessionId);

    const uploadedUrls = latestUserUploads(clientMessages);
    if (uploadedUrls.length) {
      sessionState.lastImages = dedupeImages(uploadedUrls);
    }

    const { baseMessages, artifacts } = collectMessages(clientMessages);
    const systemMessage = toBaseMessage({ role: "system", content: SYSTEM_MESSAGE.content });
    const messagesWithSystem = systemMessage ? [systemMessage, ...baseMessages] : baseMessages;

    const initialState = buildInitialState({
      baseMessages: messagesWithSystem,
      artifacts,
      lastImages: sessionState.lastImages,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const safeSend = (payload) => {
          if (!payload) return;
          sendEvent(controller, payload);
        };

        try {
          safeSend({ type: "status", status: "thinking" });

          const result = await agent.invoke(initialState, {
            configurable: { lastImages: sessionState.lastImages },
          });

          const events = Array.isArray(result.timeline) ? result.timeline : [];
          events.forEach((event) => safeSend(mapTimelineEvent(event)));

          if (result.lastImages?.length) {
            sessionState.lastImages = dedupeImages(result.lastImages);
          }

          const lastMessage = result.messages?.[result.messages.length - 1];
          if (lastMessage) {
            safeSend({ type: "content", content: formatContent(lastMessage) });
          }

          safeSend({ type: "done" });
          controller.close();
        } catch (error) {
          console.error("Agent invocation failed", error);
          safeSend({
            type: "content",
            content: `抱歉，处理时出现错误：${error.message}`,
          });
          safeSend({ type: "done" });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Agent request error", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
