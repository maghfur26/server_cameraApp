"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// createTokenJson.ts - Desktop App Version
const fs_1 = __importDefault(require("fs"));
const http_1 = __importDefault(require("http"));
const url_1 = require("url");
const open_1 = __importDefault(require("open"));
const googleapis_1 = require("googleapis");
const SCOPES = [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets",
];
const TOKEN_PATH = "token.json";
// Load credentials
const credentialsPath = "credentials.json";
if (!fs_1.default.existsSync(credentialsPath)) {
    console.error("❌ credentials.json not found!");
    process.exit(1);
}
const credentials = JSON.parse(fs_1.default.readFileSync(credentialsPath, "utf-8"));
// Support both "web" and "installed" (desktop) credential types
const clientConfig = credentials.web || credentials.installed;
if (!clientConfig) {
    console.error("❌ Invalid credentials.json format!");
    console.error("Expected either 'web' or 'installed' property");
    process.exit(1);
}
const { client_id, client_secret } = clientConfig;
// Check if token already exists
if (fs_1.default.existsSync(TOKEN_PATH)) {
    console.log(`✅ Token already exists at ${TOKEN_PATH}`);
    process.exit(0);
}
// Create server first to get the actual port
const server = http_1.default.createServer();
server.listen(0, async () => {
    const address = server.address();
    if (!address || typeof address === "string") {
        console.error("❌ Could not get server address");
        process.exit(1);
    }
    const port = address.port;
    const redirectUri = `http://localhost:${port}`;
    console.log(`📋 Using redirect URI: ${redirectUri}`);
    console.log(`🚀 Server listening on port ${port}\n`);
    // Create OAuth client with the actual redirect URI
    const oAuth2Client = new googleapis_1.google.auth.OAuth2(client_id, client_secret, redirectUri);
    // Generate authorization URL
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: SCOPES,
    });
    console.log("🔗 Opening browser for authorization...");
    console.log("If browser doesn't open, use this URL:");
    console.log(authUrl);
    console.log("");
    // Open browser
    setTimeout(() => {
        console.log("🌐 Opening browser...\n");
        (0, open_1.default)(authUrl);
    }, 500);
    // Handle the callback
    server.removeAllListeners("request");
    server.on("request", async (req, res) => {
        if (req.url?.includes("?code=") || req.url?.includes("&code=")) {
            const url = new url_1.URL(req.url, redirectUri);
            const code = url.searchParams.get("code");
            if (code) {
                res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                res.end(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Authorization Successful</title>
            </head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f0f0f0;">
              <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto;">
                <h1 style="color: #4CAF50; margin-bottom: 20px;">✅ Authorization Successful!</h1>
                <p style="color: #666; font-size: 16px;">Token has been generated successfully.</p>
                <p style="color: #999; font-size: 14px; margin-top: 30px;">You can close this window now.</p>
              </div>
            </body>
          </html>
        `);
                try {
                    const { tokens } = await oAuth2Client.getToken(code);
                    oAuth2Client.setCredentials(tokens);
                    fs_1.default.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
                    console.log(`\n✅ Token successfully stored to ${TOKEN_PATH}`);
                    console.log("🎉 You can now use the Google Drive API!");
                    setTimeout(() => {
                        server.close();
                        process.exit(0);
                    }, 1000);
                }
                catch (err) {
                    console.error("\n❌ Error retrieving access token:", err);
                    server.close();
                    process.exit(1);
                }
            }
            else {
                res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
                res.end(`
          <!DOCTYPE html>
          <html>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
              <h1 style="color: red;">❌ No authorization code found</h1>
            </body>
          </html>
        `);
            }
        }
        else {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("Not found");
        }
    });
});
server.on("error", (err) => {
    console.error("❌ Server error:", err);
    process.exit(1);
});
//# sourceMappingURL=createTokenJson.js.map