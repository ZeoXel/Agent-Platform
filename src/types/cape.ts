// Cape 类型定义

export type ExecutionType = "tool" | "workflow" | "code" | "llm" | "hybrid";
export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface Cape {
    id: string;
    name: string;
    version: string;
    description: string;
    execution_type: ExecutionType;
    risk_level: RiskLevel;
    tags: string[];
    intent_patterns: string[];
    timeout_seconds?: number;
}

export interface Pack {
    name: string;
    display_name: string;
    description: string;
    version: string;
    icon?: string;
    color?: string;
    target_users: string[];
    scenarios: string[];
    cape_ids: string[];
    cape_count: number;
}

export interface PackDetail extends Pack {
    capes: Cape[];
}

export interface FileInfo {
    file_id: string;
    original_name: string;
    content_type?: string;
    size_bytes?: number;
    download_url?: string;
}
