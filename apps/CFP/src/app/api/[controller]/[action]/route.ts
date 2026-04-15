/**
 * 動態 API 代理路由
 * 將所有 /api/{controller}/{action} 的請求轉發到後端伺服器
 * 
 * 後端 URL 格式：{API_PROXY_URL}/api/{controller}/{action}
 * 例如：https://localhost:7007/api/News/GetList
 */

import { NextRequest, NextResponse } from "next/server";
import { buildBackendUrl, API_PROXY_PATH } from "@/lib/apiProxy";

/**
 * 處理 GET 請求
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ controller: string; action: string }> }
) {
    const { controller, action } = await params;
    
    // 取得查詢參數
    const searchParams = request.nextUrl.searchParams.toString();
    const queryString = searchParams ? `?${searchParams}` : "";
    
    // 建構後端 URL
    const backendUrl = buildBackendUrl(controller, action) + queryString;
    
    // 轉發請求到後端
    const response = await fetch(backendUrl, {
        method: "GET",
        headers: getForwardHeaders(request),
        credentials: "include",
    });
    
    return handleResponse(response);
}

/**
 * 處理 POST 請求
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ controller: string; action: string }> }
) {
    const { controller, action } = await params;
    const backendUrl = buildBackendUrl(controller, action);
    
    // 取得請求體
    const body = await getRequestBody(request);
    
    // 轉發請求到後端
    const response = await fetch(backendUrl, {
        method: "POST",
        headers: getForwardHeaders(request),
        body,
        credentials: "include",
    });
    
    return handleResponse(response);
}

/**
 * 處理 PUT 請求
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ controller: string; action: string }> }
) {
    const { controller, action } = await params;
    const backendUrl = buildBackendUrl(controller, action);
    
    // 取得請求體
    const body = await getRequestBody(request);
    
    // 轉發請求到後端
    const response = await fetch(backendUrl, {
        method: "PUT",
        headers: getForwardHeaders(request),
        body,
        credentials: "include",
    });
    
    return handleResponse(response);
}

/**
 * 處理 DELETE 請求
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ controller: string; action: string }> }
) {
    const { controller, action } = await params;
    
    // 取得查詢參數（DELETE 可能帶 ID）
    const searchParams = request.nextUrl.searchParams.toString();
    const queryString = searchParams ? `?${searchParams}` : "";
    
    const backendUrl = buildBackendUrl(controller, action) + queryString;
    
    // 轉發請求到後端
    const response = await fetch(backendUrl, {
        method: "DELETE",
        headers: getForwardHeaders(request),
        credentials: "include",
    });
    
    return handleResponse(response);
}

/**
 * 取得要轉發的 Headers
 */
function getForwardHeaders(request: NextRequest): Record<string, string> {
    const headers: Record<string, string> = {
        Accept: "application/json",
    };
    
    // 轉發常見的 Header
    const headersToForward = [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "X-Api-Key",
    ];
    
    headersToForward.forEach((header) => {
        const value = request.headers.get(header);
        if (value) {
            headers[header] = value;
        }
    });
    
    return headers;
}

/**
 * 取得請求體
 */
async function getRequestBody(request: NextRequest): Promise<string | FormData | undefined> {
    const contentType = request.headers.get("Content-Type") || "";
    
    if (contentType.includes("application/json")) {
        return await request.text();
    }
    
    if (contentType.includes("multipart/form-data")) {
        return await request.formData();
    }
    
    return undefined;
}

/**
 * 處理後端回應
 */
async function handleResponse(response: Response): Promise<NextResponse> {
    const contentType = response.headers.get("Content-Type") || "";
    
    // 如果是 JSON 回應
    if (contentType.includes("application/json")) {
        const data = await response.json();
        return NextResponse.json(data, {
            status: response.status,
            headers: getResponseHeaders(response),
        });
    }
    
    // 如果是 Blob/檔案回應
    const blob = await response.blob();
    return new NextResponse(blob, {
        status: response.status,
        headers: {
            ...getResponseHeaders(response),
            "Content-Type": contentType || "application/octet-stream",
        },
    });
}

/**
 * 取得要轉發的回應 Headers
 */
function getResponseHeaders(response: Response): Record<string, string> {
    const headers: Record<string, string> = {};
    
    const headersToForward = [
        "Content-Type",
        "Content-Disposition",
        "Cache-Control",
    ];
    
    headersToForward.forEach((header) => {
        const value = response.headers.get(header);
        if (value) {
            headers[header] = value;
        }
    });
    
    return headers;
}
