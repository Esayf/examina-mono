# Passkey Authentication Backend Implementation Tasks

## Overview

This document outlines the tasks needed to implement proper passkey (WebAuthn) authentication on the Express.js backend using Bun and MongoDB.

## Database Setup

1. Create a MongoDB schema for authenticators:

   ```javascript
   // models/authenticator.js
   import mongoose from "mongoose";

   const AuthenticatorSchema = new mongoose.Schema({
     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
     credentialID: { type: String, required: true, unique: true },
     credentialPublicKey: { type: Buffer, required: true },
     counter: { type: Number, required: true, default: 0 },
     credentialDeviceType: { type: String, required: true },
     credentialBackedUp: { type: Boolean, required: true },
     transports: [{ type: String }],
     createdAt: { type: Date, default: Date.now },
   });

   export const Authenticator = mongoose.model("Authenticator", AuthenticatorSchema);
   ```

2. Create a MongoDB schema for challenges:

   ```javascript
   // models/challenge.js
   import mongoose from "mongoose";

   const ChallengeSchema = new mongoose.Schema({
     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional for authentication
     challenge: { type: String, required: true },
     expires: { type: Date, required: true },
     createdAt: { type: Date, default: Date.now },
   });

   // Add index for automatic cleanup
   ChallengeSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

   export const Challenge = mongoose.model("Challenge", ChallengeSchema);
   ```

## API Implementation

3. Implement the credentials exist endpoint:

   ```javascript
   // routes/passkey/credentials-exist.js
   import express from "express";
   import { User, Authenticator } from "../../models";

   const router = express.Router();

   router.post("/api/passkey/credentials-exist", async (req, res) => {
     try {
       const { username } = req.body;

       // If no username provided, check if any passkeys exist for the session user
       if (!username && req.user) {
         const authenticators = await Authenticator.find({ userId: req.user._id });
         return res.status(200).json({ exists: authenticators.length > 0 });
       }

       // If username is provided, check if that user has passkeys
       if (username) {
         const user = await User.findOne({ username });
         if (user) {
           const authenticators = await Authenticator.find({ userId: user._id });
           return res.status(200).json({ exists: authenticators.length > 0 });
         }
       }

       // Default to no passkeys if no user found
       return res.status(200).json({ exists: false });
     } catch (error) {
       console.error("Error checking for passkeys:", error);
       return res.status(500).json({
         message: "Failed to check for passkeys",
         details: error.message,
       });
     }
   });

   export default router;
   ```

4. Implement the registration options endpoint:

   ```javascript
   // routes/passkey/register-options.js
   import express from "express";
   import { generateRegistrationOptions } from "@simplewebauthn/server";
   import { User, Challenge } from "../../models";

   const router = express.Router();

   router.post("/api/passkey/register-options", async (req, res) => {
     try {
       const { username, displayName } = req.body;

       if (!username || !displayName) {
         return res.status(400).json({ message: "Username and displayName are required" });
       }

       // Find or create the user
       let user = await User.findOne({ username });
       if (!user) {
         user = await User.create({ username, displayName });
       }

       // Get existing authenticators for the user to exclude them
       const existingAuthenticators = await Authenticator.find({ userId: user._id });
       const excludeCredentials = existingAuthenticators.map((authenticator) => ({
         id: Buffer.from(authenticator.credentialID, "base64url"),
         type: "public-key",
         transports: authenticator.transports || [],
       }));

       // Generate registration options
       const options = await generateRegistrationOptions({
         rpName: process.env.RP_NAME || "Choz",
         rpID:
           process.env.NODE_ENV === "development"
             ? "localhost"
             : process.env.RP_ID || "your-domain.com",
         userID: Buffer.from(user._id.toString(), "utf-8"),
         userName: username,
         userDisplayName: displayName,
         attestationType: "none",
         excludeCredentials,
         authenticatorSelection: {
           residentKey: "required",
           userVerification: "preferred",
           // Don't specify authenticatorAttachment to allow browser to choose
         },
         supportedAlgorithmIDs: [-7, -257], // ES256, RS256
       });

       // Store challenge with expiration
       const expiration = new Date();
       expiration.setMinutes(expiration.getMinutes() + 5); // 5 minute expiration

       await Challenge.create({
         userId: user._id,
         challenge: options.challenge,
         expires: expiration,
       });

       return res.status(200).json(options);
     } catch (error) {
       console.error("Error generating registration options:", error);
       return res.status(500).json({
         message: "Failed to generate registration options",
         details: error.message,
       });
     }
   });

   export default router;
   ```

5. Implement the registration verification endpoint:

   ```javascript
   // routes/passkey/register-verify.js
   import express from "express";
   import { verifyRegistrationResponse } from "@simplewebauthn/server";
   import { User, Authenticator, Challenge } from "../../models";

   const router = express.Router();

   router.post("/api/passkey/register-verify", async (req, res) => {
     try {
       const { username, response } = req.body;

       if (!username || !response) {
         return res.status(400).json({ message: "Username and response are required" });
       }

       // Find the user
       const user = await User.findOne({ username });
       if (!user) {
         return res.status(400).json({ message: "User not found" });
       }

       // Get the challenge
       const challengeRecord = await Challenge.findOne({
         userId: user._id,
         expires: { $gt: new Date() },
       }).sort({ createdAt: -1 });

       if (!challengeRecord) {
         return res.status(400).json({ message: "Challenge not found or expired" });
       }

       const expectedChallenge = challengeRecord.challenge;

       // Domain settings
       const rpID =
         process.env.NODE_ENV === "development"
           ? "localhost"
           : process.env.RP_ID || "your-domain.com";
       const origin =
         process.env.NODE_ENV === "development" ? "http://localhost:3000" : `https://${rpID}`;

       // Verify the registration
       const verification = await verifyRegistrationResponse({
         response,
         expectedChallenge,
         expectedOrigin: origin,
         expectedRPID: rpID,
       });

       const { verified, registrationInfo } = verification;

       if (!verified || !registrationInfo) {
         return res.status(400).json({ message: "Verification failed" });
       }

       // Create the new authenticator in the database
       const newAuthenticator = {
         userId: user._id,
         credentialID: registrationInfo.credentialID,
         credentialPublicKey: registrationInfo.credentialPublicKey,
         counter: registrationInfo.counter,
         credentialDeviceType: registrationInfo.credentialDeviceType,
         credentialBackedUp: registrationInfo.credentialBackedUp,
         transports: response.transports || [],
       };

       await Authenticator.create(newAuthenticator);

       // Delete the used challenge
       await Challenge.deleteOne({ _id: challengeRecord._id });

       return res.status(200).json({ verified });
     } catch (error) {
       console.error("Error verifying registration:", error);
       return res.status(500).json({
         message: "Failed to verify registration",
         details: error.message,
       });
     }
   });

   export default router;
   ```

6. Implement the authentication options endpoint:

   ```javascript
   // routes/passkey/auth-options.js
   import express from "express";
   import { generateAuthenticationOptions } from "@simplewebauthn/server";
   import { User, Authenticator, Challenge } from "../../models";

   const router = express.Router();

   router.post("/api/passkey/auth-options", async (req, res) => {
     try {
       const { username } = req.body;
       let allowCredentials = [];
       let userId = null;

       // If username is provided, get the specific user's authenticators
       if (username) {
         const user = await User.findOne({ username });
         if (user) {
           userId = user._id;
           const userAuthenticators = await Authenticator.find({ userId: user._id });

           allowCredentials = userAuthenticators.map((authenticator) => ({
             id: Buffer.from(authenticator.credentialID, "base64url"),
             type: "public-key",
             transports: authenticator.transports || [],
           }));
         }
       }

       // Generate authentication options
       const options = await generateAuthenticationOptions({
         rpID:
           process.env.NODE_ENV === "development"
             ? "localhost"
             : process.env.RP_ID || "your-domain.com",
         userVerification: "preferred",
         // Only include allowCredentials if there are credentials to include
         ...(allowCredentials.length > 0 ? { allowCredentials } : {}),
       });

       // Store the challenge
       const expiration = new Date();
       expiration.setMinutes(expiration.getMinutes() + 5); // 5 minute expiration

       await Challenge.create({
         userId, // May be null for discoverable credentials
         challenge: options.challenge,
         expires: expiration,
       });

       return res.status(200).json(options);
     } catch (error) {
       console.error("Error generating authentication options:", error);
       return res.status(500).json({
         message: "Failed to generate authentication options",
         details: error.message,
       });
     }
   });

   export default router;
   ```

7. Implement the authentication verification endpoint:

   ```javascript
   // routes/passkey/auth-verify.js
   import express from "express";
   import { verifyAuthenticationResponse } from "@simplewebauthn/server";
   import { User, Authenticator, Challenge } from "../../models";
   import jwt from "jsonwebtoken";

   const router = express.Router();

   router.post("/api/passkey/auth-verify", async (req, res) => {
     try {
       const { response } = req.body;

       if (!response) {
         return res.status(400).json({ message: "Response is required" });
       }

       // Get credential ID from the authentication response
       const credentialID = response.id;

       // Find the authenticator in our database
       const authenticator = await Authenticator.findOne({ credentialID });
       if (!authenticator) {
         return res.status(400).json({ message: "Authenticator not found" });
       }

       // Find the user
       const user = await User.findById(authenticator.userId);
       if (!user) {
         return res.status(400).json({ message: "User not found" });
       }

       // Get the most recent challenge
       const challengeRecord = await Challenge.findOne({
         $or: [
           { userId: user._id },
           { userId: null }, // For discoverable credentials with no userId
         ],
         expires: { $gt: new Date() },
       }).sort({ createdAt: -1 });

       if (!challengeRecord) {
         return res.status(400).json({ message: "Challenge not found or expired" });
       }

       const expectedChallenge = challengeRecord.challenge;

       // Domain settings
       const rpID =
         process.env.NODE_ENV === "development"
           ? "localhost"
           : process.env.RP_ID || "your-domain.com";
       const origin =
         process.env.NODE_ENV === "development" ? "http://localhost:3000" : `https://${rpID}`;

       // Verify the authentication response
       const verification = await verifyAuthenticationResponse({
         response,
         expectedChallenge,
         expectedOrigin: origin,
         expectedRPID: rpID,
         authenticator: {
           credentialID: authenticator.credentialID,
           credentialPublicKey: authenticator.credentialPublicKey,
           counter: authenticator.counter,
         },
       });

       const { verified, authenticationInfo } = verification;

       if (!verified) {
         return res.status(400).json({ message: "Authentication failed" });
       }

       // Update the authenticator counter
       await Authenticator.updateOne(
         { _id: authenticator._id },
         { counter: authenticationInfo.newCounter }
       );

       // Delete the used challenge
       await Challenge.deleteOne({ _id: challengeRecord._id });

       // Create a session
       const session = {
         id: jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" }),
         user: {
           id: user._id,
           username: user.username,
           displayName: user.displayName,
         },
         createdAt: new Date().toISOString(),
       };

       return res.status(200).json({
         verified,
         session,
       });
     } catch (error) {
       console.error("Error verifying authentication:", error);
       return res.status(500).json({
         message: "Failed to verify authentication",
         details: error.message,
       });
     }
   });

   export default router;
   ```

## Environment Configuration

8. Set up environment variables in `.env` file:

   ```
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/choz

   # WebAuthn Settings
   RP_NAME=Choz
   RP_ID=your-domain.com

   # For production
   NEXT_PUBLIC_RP_ID=your-domain.com
   NEXT_PUBLIC_ORIGIN=https://your-domain.com

   # JWT Secret
   JWT_SECRET=your-secure-jwt-secret-key
   ```

## Security Considerations

Implement rate limiting to prevent brute force attacks:

```javascript
import rateLimit from "express-rate-limit";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to all passkey routes
app.use("/api/passkey", apiLimiter);
```

Implement regular challenge cleanup:

    ```javascript
    // Set up a cron job or use MongoDB TTL index (already configured in the schema)
    // The TTL index will automatically delete expired challenges
    ```

Implement secure headers with Helmet:
`javascript
    import helmet from "helmet";
    app.use(helmet());
    `

## Testing

Create test scripts for: - User registration - User authentication - Passkey registration - Passkey authentication - Challenge expiration handling - Error handling

## Monitoring & Maintenance

16. Implement logging and monitoring:

    ```javascript
    import winston from "winston";

    const logger = winston.createLogger({
      level: "info",
      format: winston.format.json(),
      defaultMeta: { service: "passkey-service" },
      transports: [
        new winston.transports.File({ filename: "error.log", level: "error" }),
        new winston.transports.File({ filename: "combined.log" }),
      ],
    });

    if (process.env.NODE_ENV !== "production") {
      logger.add(
        new winston.transports.Console({
          format: winston.format.simple(),
        })
      );
    }
    ```
