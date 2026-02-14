import { NextResponse } from 'next/server';

/**
 * Standard API envelope: { success, data, error }.
 * Success: data holds payload. Error: error holds message (string or { message, code? }).
 */

/**
 * Return a success response with envelope { success: true, data }.
 * @param {object} data - Payload (will be under data)
 * @param {number} [status=200]
 */
export function successResponse(data, status = 200) {
    return NextResponse.json({ success: true, data }, { status });
}

/**
 * Return an error response with envelope { success: false, error }.
 * @param {string|{ message: string, code?: string }} error - Error message or object
 * @param {number} [status=400]
 */
export function errorResponse(error, status = 400) {
    const body = { success: false, error: typeof error === 'string' ? error : error };
    return NextResponse.json(body, { status });
}
