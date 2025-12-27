import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace('https://http://', 'http://');

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    return handleRequest(request, params, 'GET');
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    return handleRequest(request, params, 'POST');
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    return handleRequest(request, params, 'PUT');
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    return handleRequest(request, params, 'DELETE');
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    return handleRequest(request, params, 'PATCH');
}

async function handleRequest(
    request: NextRequest,
    params: Promise<{ path: string[] }>,
    method: string
) {
    try {
        const { path } = await params;
        const backendPath = path.join('/');
        const url = `${BACKEND_URL}/${backendPath}`;

        // Get search params from the original request
        const searchParams = request.nextUrl.searchParams.toString();
        const fullUrl = searchParams ? `${url}?${searchParams}` : url;

        console.log(`[API Proxy] ${method} ${fullUrl}`);

        // Prepare headers
        const headers: HeadersInit = {};

        // Forward important headers
        const headersToForward = [
            'content-type',
            'authorization',
            'cookie',
            'accept',
            'accept-language',
        ];

        headersToForward.forEach((headerName) => {
            const value = request.headers.get(headerName);
            if (value) {
                headers[headerName] = value;
            }
        });

        // Prepare request options
        const options: RequestInit = {
            method,
            headers,
        };

        // Add body for methods that support it
        if (['POST', 'PUT', 'PATCH'].includes(method)) {
            try {
                const body = await request.text();
                if (body) {
                    options.body = body;
                }
            } catch (e) {
                console.error('[API Proxy] Error reading request body:', e);
            }
        }

        // Make the request to the backend
        const response = await fetch(fullUrl, options);

        // Get response body
        const responseText = await response.text();
        let responseData;

        try {
            responseData = JSON.parse(responseText);
        } catch {
            responseData = responseText;
        }

        console.log(`[API Proxy] Response ${response.status} from ${fullUrl}`);

        // Return the response
        return NextResponse.json(responseData, {
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error: any) {
        console.error('[API Proxy] Error:', error);
        return NextResponse.json(
            {
                error: 'Proxy request failed',
                message: error.message,
                details: error.toString()
            },
            { status: 500 }
        );
    }
}
