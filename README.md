# PineappleNarrator - Secure Messaging with AWS Cognito

A secure web application that integrates AWS Cognito authentication with your existing messaging API. This setup ensures that only authenticated users can access your API endpoints while keeping all code open source and deployable on GitHub Pages.

## 🔐 Security Overview

This application implements a secure client-side authentication flow where:
- Users authenticate with AWS Cognito
- JWT tokens are automatically included in API requests
- Your API Gateway validates tokens server-side
- No sensitive credentials are exposed in the client code

## 🚀 Features

- ✅ AWS Cognito OIDC authentication
- ✅ Automatic token management and renewal
- ✅ Protected API calls with JWT authorization
- ✅ Modern, responsive UI
- ✅ GitHub Pages compatible
- ✅ No server-side code required for the client

## 📋 Prerequisites

1. AWS Cognito User Pool configured with:
   - App Client ID: `7e8gg5immk9kupv2sriu8ko6pp`
   - User Pool ID: `eu-west-3_TwLpWJISp`
   - Domain configured for hosted UI
2. API Gateway endpoint: `https://dmc3oj2v8b.execute-api.eu-west-3.amazonaws.com/prod`

## 🛠️ Setup Instructions

### 1. Configure AWS Cognito App Client

In your Cognito User Pool App Client, configure:

**Allowed callback URLs:**
```
https://your-domain.github.io/callback.html
http://localhost:3000/callback.html  (for development)
```

**Allowed sign out URLs:**
```
https://your-domain.github.io/index.html
http://localhost:3000/index.html  (for development)
```

**OAuth 2.0 Scopes:**
- `openid`
- `email`
- `phone`

### 2. Install Dependencies

```bash
npm install
```

### 3. Update Configuration

In `main.js`, update the configuration if needed:

```javascript
const cognitoAuthConfig = {
    authority: "https://cognito-idp.eu-west-3.amazonaws.com/eu-west-3_TwLpWJISp",
    client_id: "7e8gg5immk9kupv2sriu8ko6pp",
    redirect_uri: window.location.origin + "/callback.html",
    // ... other settings
};
```

### 4. Run Locally

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔒 Securing Your API Gateway

**CRITICAL:** To ensure security, your API Gateway must validate JWT tokens. Here's how to configure this:

### Option 1: Using a Lambda Authorizer (Recommended)

Create a Lambda function that validates Cognito JWT tokens:

```python
import json
import jwt
import requests
from jwt.algorithms import RSAAlgorithm

def lambda_handler(event, context):
    # Get the token from the Authorization header
    token = event['authorizationToken'].replace('Bearer ', '')
    
    try:
        # Get Cognito public keys
        region = 'eu-west-3'
        user_pool_id = 'eu-west-3_TwLpWJISp'
        
        keys_url = f'https://cognito-idp.{region}.amazonaws.com/{user_pool_id}/.well-known/jwks.json'
        response = requests.get(keys_url)
        keys = response.json()['keys']
        
        # Decode and validate token
        headers = jwt.get_unverified_header(token)
        kid = headers['kid']
        
        # Find the correct key
        key = next((k for k in keys if k['kid'] == kid), None)
        if not key:
            raise Exception('Public key not found')
        
        public_key = RSAAlgorithm.from_jwk(json.dumps(key))
        
        # Verify token
        payload = jwt.decode(
            token,
            public_key,
            algorithms=['RS256'],
            audience='7e8gg5immk9kupv2sriu8ko6pp',  # Your app client ID
            issuer=f'https://cognito-idp.{region}.amazonaws.com/{user_pool_id}'
        )
        
        # Token is valid, allow access
        return generate_policy('user', 'Allow', event['methodArn'])
        
    except Exception as e:
        print(f'Token validation failed: {str(e)}')
        return generate_policy('user', 'Deny', event['methodArn'])

def generate_policy(principal_id, effect, resource):
    return {
        'principalId': principal_id,
        'policyDocument': {
            'Version': '2012-10-17',
            'Statement': [
                {
                    'Action': 'execute-api:Invoke',
                    'Effect': effect,
                    'Resource': resource
                }
            ]
        }
    }
```

### Option 2: Using API Gateway JWT Authorizer

Configure your API Gateway with a JWT Authorizer:

1. In API Gateway Console, go to **Authorizers**
2. Create new **JWT Authorizer**:
   - **Name**: `CognitoAuthorizer`
   - **Identity source**: `$request.header.Authorization`
   - **Issuer URL**: `https://cognito-idp.eu-west-3.amazonaws.com/eu-west-3_TwLpWJISp`
   - **Audience**: `7e8gg5immk9kupv2sriu8ko6pp`

3. Attach the authorizer to your API methods

### CORS Configuration

Ensure your API Gateway has CORS enabled:

```json
{
  "Access-Control-Allow-Origin": "https://your-domain.github.io",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "POST,OPTIONS"
}
```

## 📱 Usage

1. **Login**: Visit the application and click "Accedi con AWS Cognito"
2. **Authentication**: Complete the Cognito hosted UI flow
3. **Send Messages**: Use the authenticated interface to send messages
4. **Automatic Token Handling**: Tokens are automatically included in API requests
5. **Logout**: Click "Esci" to sign out

## 🌐 Deploying to GitHub Pages

**✅ This application is 100% GitHub Pages compatible!** No build process or server required.

### Quick Deploy Steps:

1. **Create GitHub Repository**: 
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Cognito auth app"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/PineappleNarrator.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub.com
   - Navigate to **Settings** → **Pages**  
   - **Source**: Deploy from a branch
   - **Branch**: `main` 
   - **Folder**: `/` (root)
   - Click **Save**

3. **Update AWS Cognito URLs** (IMPORTANT):
   
   In your Cognito User Pool App Client settings, add:
   
   **Allowed callback URLs:**
   ```
   https://YOUR_USERNAME.github.io/PineappleNarrator/callback.html
   ```
   
   **Allowed sign out URLs:**
   ```
   https://YOUR_USERNAME.github.io/PineappleNarrator/index.html
   ```

4. **Update API Gateway CORS**:
   ```json
   {
     "Access-Control-Allow-Origin": "https://YOUR_USERNAME.github.io",
     "Access-Control-Allow-Headers": "Content-Type,Authorization",
     "Access-Control-Allow-Methods": "POST,OPTIONS"
   }
   ```

5. **Access Your App**: 
   - Your app will be live at: `https://YOUR_USERNAME.github.io/PineappleNarrator`
   - GitHub Pages typically takes 1-10 minutes to deploy

### Why This Works on GitHub Pages:

- ✅ **Pure Static Files**: Only HTML, CSS, and JavaScript
- ✅ **CDN Dependencies**: Libraries loaded from Skypack CDN  
- ✅ **ES Modules**: Supported natively by GitHub Pages HTTPS
- ✅ **No Build Step**: Ready to deploy as-is
- ✅ **No Secrets**: All authentication handled by AWS Cognito

## 🔧 File Structure

```
├── index.html          # Login page
├── callback.html       # OAuth callback handler  
├── app.html           # Main application
├── silent-renew.html  # Silent token renewal
├── main.js           # Authentication logic
├── sender.js         # API communication (secured)
└── package.json      # Dependencies
```

## ⚠️ Security Notes

1. **Client-Side Security**: While the client code is open source, security is maintained through server-side token validation
2. **Token Expiry**: Tokens automatically expire and are renewed silently
3. **No Secrets**: No sensitive information is stored in the client code
4. **HTTPS Only**: Always use HTTPS in production (GitHub Pages provides this automatically)

## 🐛 Troubleshooting

### Common Issues:

1. **CORS Errors**: Ensure your API Gateway has proper CORS configuration
2. **Token Validation Fails**: Verify your Lambda authorizer or JWT authorizer configuration
3. **Redirect Issues**: Check Cognito callback URLs match your domain exactly
4. **Module Import Errors**: Ensure you're serving the files from a web server (not opening directly in browser)

### Development Mode:

```bash
# Serve locally with CORS support
npm run dev

# Access at http://localhost:3000
```

## 📧 Support

If you encounter issues:
1. Check browser developer console for errors
2. Verify AWS Cognito configuration
3. Ensure API Gateway authorizer is properly configured
4. Test authentication flow step by step

## 🔄 Token Flow Diagram

```
User → Login Page → Cognito Hosted UI → Callback → Main App
                                        ↓
JWT Token → API Request → API Gateway → Lambda/Authorizer → Your Backend
```

The JWT token contains user information and is cryptographically signed by AWS Cognito, making it impossible to forge without access to AWS private keys. 