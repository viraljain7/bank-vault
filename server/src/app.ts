import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";

import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { env } from "./config/env.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/errorHandler.js";

import {
  requireAuth,
  type ClerkTokenVerifier,
} from "./middleware/auth.js";

import { createVaultRouter } from "./modules/vault/vault.routes.js";
import { createKeysRouter } from "./modules/keys/keys.routes.js";
import { createActivityRouter } from "./modules/activity/activity.routes.js";
import { createSecurityRouter } from "./modules/security/security.routes.js";

/**
 * ---------------------------------------------------------
 * ESM __dirname
 * ---------------------------------------------------------
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ---------------------------------------------------------
 * Sanitize sensitive query parameters
 * ---------------------------------------------------------
 */

function sanitizeQuery(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const blocked = [
    "password",
    "cardnumber",
    "cvv",
    "otp",
    "token",
  ];

  for (const key of Object.keys(req.query)) {
    if (blocked.includes(key.toLowerCase())) {
      delete req.query[key];
    }
  }

  next();
}

/**
 * ---------------------------------------------------------
 * Find React/Vite production build
 * ---------------------------------------------------------
 *
 * Supports common project structures:
 *
 * project/
 * ├── client/
 * │   └── dist/
 * │       ├── index.html
 * │       └── assets/
 *
 * OR
 *
 * project/
 * ├── server/
 * │   └── dist/
 * └── client/
 *     └── dist/
 *
 * ---------------------------------------------------------
 */

function getFrontendPath(): string {
  const possiblePaths = [
    // If app is started from project root
    path.resolve(process.cwd(), "client/dist"),

    // If server is started from server directory
    path.resolve(process.cwd(), "../client/dist"),

    // If compiled file is server/dist/app.js
    path.resolve(__dirname, "../../client/dist"),

    // If compiled file is server/dist/src/app.js
    path.resolve(__dirname, "../../../client/dist"),
  ];

  const frontendPath = possiblePaths.find((directory) => {
    return fs.existsSync(
      path.join(directory, "index.html"),
    );
  });

  if (!frontendPath) {
    console.error(
      "\n❌ React production build not found.\n",
    );

    console.error("Checked paths:");

    for (const directory of possiblePaths) {
      console.error(`  - ${directory}`);
    }

    console.error(
      "\nRun the React/Vite production build first:\n",
    );

    console.error("  cd client");
    console.error("  npm run build\n");

    // Return the primary expected path so the error
    // handler can still report the problem.
    return possiblePaths[0]!;
  }

  console.log(
    `✅ React frontend found: ${frontendPath}`,
  );

  return frontendPath;
}

/**
 * ---------------------------------------------------------
 * App options
 * ---------------------------------------------------------
 */

export interface CreateAppOptions {
  /**
   * Override Clerk verifier.
   * Used by tests.
   */
  authVerifier?: ClerkTokenVerifier;
}

/**
 * ---------------------------------------------------------
 * Create Express App
 * ---------------------------------------------------------
 */

export function createApp(
  options: CreateAppOptions = {},
): Express {
  const app = express();

  /**
   * -------------------------------------------------------
   * Basic Express settings
   * -------------------------------------------------------
   */

  app.disable("x-powered-by");

  app.set(
    "trust proxy",
    env.TRUST_PROXY ? 1 : 0,
  );

  /**
   * -------------------------------------------------------
   * Security Headers / CSP
   * -------------------------------------------------------
   */

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",

          // Your Clerk frontend API/custom domain
          "https://clerk.jainviral.com",

          // Clerk development/custom hosts if still used anywhere
          "https://*.clerk.accounts.dev",

          // ⭐ Required by Clerk CAPTCHA / Turnstile
          "https://challenges.cloudflare.com",

          // ⭐ Clerk abuse/fraud protection
          "https://*.protect.clerk.com",
        ],

        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
        ],

        fontSrc: [
          "'self'",
          "data:",
          "https://fonts.gstatic.com",
        ],

        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https:",
          "https://img.clerk.com",
        ],

        connectSrc: [
          "'self'",

          // Your Clerk custom frontend API
          "https://clerk.jainviral.com",

          // Clerk
          "https://*.clerk.accounts.dev",
          "https://api.clerk.com",

          // ⭐ Clerk abuse/fraud protection
          "https://*.protect.clerk.com:*",

          // ⭐ Cloudflare Turnstile
          "https://challenges.cloudflare.com",
        ],

        frameSrc: [
          "'self'",

          // ⭐ Cloudflare Turnstile
          "https://challenges.cloudflare.com",

          // Clerk
          "https://clerk.jainviral.com",
          "https://*.clerk.accounts.dev",

          // ⭐ Clerk protection
          "https://*.protect.clerk.com",
        ],

        workerSrc: [
          "'self'",
          "blob:",
        ],

        childSrc: [
          "'self'",
          "blob:",
          "https://challenges.cloudflare.com",
          "https://*.protect.clerk.com",
        ],

        frameAncestors: ["'none'"],

        formAction: ["'self'"],
      },
    },

    crossOriginEmbedderPolicy: false,
  }),
);

  /**
   * -------------------------------------------------------
   * CORS
   * -------------------------------------------------------
   */

  app.use(
    cors({
      origin(origin, callback) {
        /**
         * Allow non-browser requests
         * such as curl/Postman/server-to-server.
         */
        if (!origin) {
          return callback(null, true);
        }

        /**
         * Allow configured origins.
         */
        if (
          env.CORS_ORIGINS.includes("*") ||
          env.CORS_ORIGINS.includes(origin)
        ) {
          return callback(null, true);
        }

        return callback(
          new Error("Origin not allowed"),
        );
      },

      methods: [
        "GET",
        "POST",
        "PATCH",
        "DELETE",
        "OPTIONS",
      ],

      allowedHeaders: [
        "Content-Type",
        "Authorization",
      ],

      credentials: true,

      maxAge: 86400,
    }),
  );

  /**
   * -------------------------------------------------------
   * Compression
   * -------------------------------------------------------
   */

  app.use(compression());

  /**
   * -------------------------------------------------------
   * JSON parser
   * -------------------------------------------------------
   */

  app.use(
    express.json({
      limit: "64kb",
    }),
  );

  /**
   * -------------------------------------------------------
   * Sanitize query parameters
   * -------------------------------------------------------
   */

  app.use(sanitizeQuery);

  /**
   * -------------------------------------------------------
   * Health check
   * -------------------------------------------------------
   */

  app.get("/health", (_req, res) => {
    res.json({
      success: true,
      data: {
        status: "ok",
        name: "vaultbank-api",
      },
    });
  });

  /**
   * -------------------------------------------------------
   * Authentication
   * -------------------------------------------------------
   */

  const auth = options.authVerifier
    ? requireAuth(options.authVerifier)
    : requireAuth();

  /**
   * -------------------------------------------------------
   * API Routes
   * -------------------------------------------------------
   */

  app.use(
    "/api/v1/vault",
    createVaultRouter(auth),
  );

  app.use(
    "/api/v1/keys",
    createKeysRouter(auth),
  );

  app.use(
    "/api/v1/activity",
    createActivityRouter(auth),
  );

  app.use(
    "/api/v1/security",
    createSecurityRouter(auth),
  );

  /**
   * -------------------------------------------------------
   * React / Vite Production Build
   * -------------------------------------------------------
   */

  if (process.env.NODE_ENV === "production") {
    const frontendPath = getFrontendPath();

    console.log(
      `📦 Serving React frontend from: ${frontendPath}`,
    );

    /**
     * Static assets
     *
     * This MUST come before the SPA fallback.
     *
     * Example:
     *
     * /assets/index-CzOfBWNJ.css
     * /assets/index-xxxxx.js
     */
    app.use(
      express.static(frontendPath, {
        index: false,

        /**
         * Browser caching for Vite hashed assets.
         */
        setHeaders(res, filePath) {
          if (
            filePath.includes(
              `${path.sep}assets${path.sep}`,
            )
          ) {
            res.setHeader(
              "Cache-Control",
              "public, max-age=31536000, immutable",
            );
          }
        },
      }),
    );

    /**
     * React SPA fallback
     *
     * Only non-API browser routes should reach this.
     */
    app.get("*", (req, res, next) => {
      /**
       * Never return React index.html for API routes.
       */
      if (req.path.startsWith("/api/")) {
        return next();
      }

      /**
       * Don't interfere with health endpoint.
       */
      if (req.path === "/health") {
        return next();
      }

      const indexPath = path.join(
        frontendPath,
        "index.html",
      );

      /**
       * Make sure index.html exists.
       */
      if (!fs.existsSync(indexPath)) {
        console.error(
          `❌ React index.html not found: ${indexPath}`,
        );

        return next(
          new Error(
            "React production build not found",
          ),
        );
      }

      return res.sendFile(indexPath);
    });
  }

  /**
   * -------------------------------------------------------
   * 404
   * -------------------------------------------------------
   */

  app.use(notFoundHandler);

  /**
   * -------------------------------------------------------
   * Global Error Handler
   * -------------------------------------------------------
   */

  app.use(errorHandler);

  return app;
}