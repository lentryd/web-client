import { posix } from "path";

/**
 * Join the path to the origin
 * @param origin Origin
 * @param paths Path to the required resource
 * @returns Full path to the resource
 */
export function joinURL(origin: string, ...paths: string[]) {
  return new URL(posix.join(...paths), origin).href;
}

const absoluteRegex = new RegExp("^(?:[a-z]+:)?//", "i");

/**
 * Check if a path is absolute
 * @param path Path to check
 * @returns Is the path absolute or not
 */
export function isAbsolute(path: string) {
  return absoluteRegex.test(path);
}

/**
 * Encodes an object into a query string
 * @param params Object to encode
 * @returns Encoded query string
 */
export function encodeQuery(params?: { [key: string]: any }) {
  // If the object is not passed, return an empty string
  if (!params) return "";

  // Get the keys of the object
  let paramsKeys = Object.keys(params);
  // If there are no keys, return an empty string
  if (paramsKeys.length === 0) return "";

  // Filter out keys with undefined values
  paramsKeys = paramsKeys.filter((key) => params[key] !== undefined);
  // If there are no keys, return an empty string
  if (paramsKeys.length === 0) return "";

  // Encode the object into a query string
  let query = paramsKeys
    .map((key) => `${key}=${encodeURIComponent(params[key])}`)
    .join("&");

  // Return the query string
  return `?${query}`;
}
