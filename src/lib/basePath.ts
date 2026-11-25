// Must match basePath in next.config.mjs; tests/unit/basePath.test.ts checks this.
export const BASE_PATH = "/TMPNet";

// Next.js adds basePath to <Link> and router URLs, but not to fetch() or asset URLs.
export const withBasePath = (path: string): string => `${BASE_PATH}${path}`;
