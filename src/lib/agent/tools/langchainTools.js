import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { executeGenerateImage, executeEditImage } from "@/lib/agent/tools/executors";
import { TOOL_NAMES } from "@/lib/agent/config";

export const generateImageTool = new StructuredTool({
  name: TOOL_NAMES.GENERATE_IMAGE,
  description: "根据文字提示生成全新的图片，适合插画、海报等视觉内容。",
  schema: z.object({
    prompt: z.string().min(4, "提示词至少4个字符"),
    aspect_ratio: z.string().optional(),
    image_size: z.string().optional(),
    response_format: z.enum(["url", "b64_json"]).optional(),
  }),
  func: async (args) => {
    const result = await executeGenerateImage(args);
    return {
      type: "generate",
      args,
      images: result.images,
      raw: result.raw,
    };
  },
});

export const editImageTool = new StructuredTool({
  name: TOOL_NAMES.EDIT_IMAGE,
  description: "基于已有图片进行编辑，可调整细节或加入新元素。",
  schema: z.object({
    prompt: z.string().min(4, "描述修改的提示词"),
    image_url: z.string().url().optional(),
    response_format: z.enum(["url", "b64_json"]).optional(),
  }),
  func: async (args, config) => {
    const contextLastImages = config?.configurable?.lastImages;
    const result = await executeEditImage(args, contextLastImages);
    return {
      type: "edit",
      args,
      images: result.images,
      raw: result.raw,
    };
  },
});

export const LANGCHAIN_TOOLS = [generateImageTool, editImageTool];
