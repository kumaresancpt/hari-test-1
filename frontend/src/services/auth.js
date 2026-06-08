async function readJson(response) {
    const rawBody = await response.text();
    if (!rawBody) {
        return null;
    }
    return JSON.parse(rawBody);
}

async function parseError(response, fallbackMessage) {
    const errorBody = await readJson(response);
    throw new Error((errorBody == null ? void 0 : errorBody.detail) ?? fallbackMessage);
}

export async function loginRequest(payload) {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        await parseError(response, 'Login failed. Please verify your credentials.');
    }
    const data = await readJson(response);
    if (!data) {
        throw new Error('Login response was empty.');
    }
    return data;
}

export async function forgotPasswordRequest(payload) {
    const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        await parseError(response, 'Unable to start password reset.');
    }
    const data = await readJson(response);
    if (!data) {
        throw new Error('Forgot password response was empty.');
    }
    return data;
}

export async function resetPasswordRequest(payload) {
    const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        await parseError(response, 'Unable to reset password.');
    }
    const data = await readJson(response);
    if (!data) {
        throw new Error('Reset password response was empty.');
    }
    return data;
}
