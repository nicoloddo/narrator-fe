import { UserManager } from "https://cdn.skypack.dev/oidc-client-ts@3.0.1";

const cognitoAuthConfig = {
    authority: "https://cognito-idp.eu-west-3.amazonaws.com/eu-west-3_TwLpWJISp",
    client_id: "7e8gg5immk9kupv2sriu8ko6pp",
    redirect_uri: window.location.origin + "/callback.html",
    post_logout_redirect_uri: window.location.origin + "/index.html",
    response_type: "code",
    scope: "phone openid email profile",
    automaticSilentRenew: true,
    silent_redirect_uri: window.location.origin + "/silent-renew.html"
};

// Create a UserManager instance
export const userManager = new UserManager(cognitoAuthConfig);

// Get current user
export async function getUser() {
    try {
        return await userManager.getUser();
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
}

// Check if user is authenticated
export async function isAuthenticated() {
    const user = await getUser();
    return user && !user.expired;
}

// Sign in redirect
export async function signIn() {
    try {
        await userManager.signinRedirect();
    } catch (error) {
        console.error('Error signing in:', error);
        throw error;
    }
}

// Sign out redirect
export async function signOut() {
    try {
        await userManager.signoutRedirect();
    } catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
}

// Handle signin callback
export async function handleSigninCallback() {
    try {
        const user = await userManager.signinCallback();
        return user;
    } catch (error) {
        console.error('Error handling signin callback:', error);
        throw error;
    }
}

// Get access token for API calls
export async function getAccessToken() {
    const user = await getUser();
    return user ? user.access_token : null;
}

// Auto-redirect to app if already authenticated
export async function checkAuthAndRedirect() {
    if (await isAuthenticated()) {
        if (window.location.pathname === '/index.html' || window.location.pathname === '/') {
            window.location.href = '/app.html';
        }
    }
} 