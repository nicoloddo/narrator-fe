// sender.js
import { getAccessToken } from './main.js';

export function sendMessage(message, confirmButton, responseDiv, confirm_text) {
    return new Promise(async (resolve, reject) => {
        // Get the access token for authentication
        const accessToken = await getAccessToken();
        
        if (!accessToken) {
            responseDiv.textContent = "You are not authenticated. Please log in.";
            responseDiv.style.display = 'block';
            confirmButton.disabled = false;
            reject(new Error('User not authenticated'));
            return;
        }

        const url = 'https://dmc3oj2v8b.execute-api.eu-west-3.amazonaws.com/prod'; // Your API Gateway URL
        let req = new XMLHttpRequest();
        req.onreadystatechange = () => {
            if (req.readyState === XMLHttpRequest.DONE) {
                if (req.status === 200) {
                    console.log(req.responseText);
                    responseDiv.textContent = confirm_text;
                    responseDiv.style.display = 'block';
                    resolve(req.responseText); // Resolve the promise with the response
                } else if (req.status === 401 || req.status === 403) {
                    console.error('Authentication error:', req.status, req.statusText);
                    responseDiv.textContent = "Session expired. Reload the page to log in again.";
                    responseDiv.style.display = 'block';
                    reject(new Error(`Authentication failed with status ${req.status}`));
                } else {
                    console.error('Error:', req.status, req.statusText);
                    responseDiv.textContent = "Error sending request. Please try again later.";
                    responseDiv.style.display = 'block';
                    reject(new Error(`Request failed with status ${req.status}`)); // Reject the promise with an error
                }
                confirmButton.disabled = false;
            }
        };

        // Construct the URL with the SQS API version
        const apiUrl = `${url}?Version=2012-11-05`;
        
        req.open("POST", apiUrl, true);
        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        // Add Authorization header with JWT token
        req.setRequestHeader("Authorization", `Bearer ${accessToken}`);
        
        const messageDeduplicationId = Date.now().toString();

        // Construct the request body
        const params = new URLSearchParams({
            Action: 'SendMessage',
            MessageBody: message,
            MessageGroupId: 'default',
            MessageDeduplicationId: messageDeduplicationId,
            Version: '2012-11-05'
        });
        
        req.send(params.toString());
        confirmButton.disabled = true; // Disable the button to prevent multiple clicks
    });
}
