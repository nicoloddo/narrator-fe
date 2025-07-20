import { UserManager } from "https://cdn.skypack.dev/oidc-client-ts@3.0.1";

const cognitoAuthConfig = {
    authority: "https://cognito-idp.eu-west-3.amazonaws.com/eu-west-3_TwLpWJISp",
    client_id: "7e8gg5immk9kupv2sriu8ko6pp",
    redirect_uri: "https://nicoloddo.github.io/narrator-fe/callback.html",
    response_type: "code",
    scope: "email openid phone profile"
};

// Create a UserManager instance
export const userManager = new UserManager({
    ...cognitoAuthConfig,
});

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

// Sign out redirect (following AWS documentation pattern)
export async function signOut() {
    try {
        const clientId = "7e8gg5immk9kupv2sriu8ko6pp";
        const logoutUri = "https://nicoloddo.github.io/narrator-fe/index.html";
        const cognitoDomain = "https://eu-west-3twlpwjisp.auth.eu-west-3.amazoncognito.com";
        window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
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
        if (window.location.pathname === '/narrator-fe/index.html' || window.location.pathname === '/narrator-fe/') {
            window.location.href = '/narrator-fe/app.html';
        }
    }
} 