import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Create the i18n middleware
const intlMiddleware = createMiddleware(routing);

export default intlMiddleware;

export const config = {
  matcher: [
    // Match all pathnames except for
    // - api routes
    // - static files (files with extensions)
    // - _next internal paths
    "/((?!api|_next|.*\\..*).*)",
  ],
};
