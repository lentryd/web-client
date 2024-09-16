import { ExtraHeaders, ExtraHeadersRaw } from "./index";

/**
 * Get headers in the correct format
 * @param headers Headers object
 * @returns Headers object in the correct format
 */
export function getHeaders(headers: ExtraHeaders) {
  // Create an object for headers
  let data: ExtraHeadersRaw = {};

  // Go through all the headers
  for (let { key, value } of headers) {
    // Get the value of the header
    const result = typeof value === "function" ? value() : value;

    // If the value is empty, skip the header
    if (!result) continue;
    // Otherwise, add the header to the object
    else data[key] = result;
  }

  return data;
}

/**
 * Set a header in the headers
 * @param headers Headers object
 * @param key Header key
 * @param value Header value
 * @returns Headers object with the specified header
 */
export function setHeaders(
  headers: ExtraHeaders,
  key: string,
  value: string | (() => string | undefined)
) {
  // Find the header by key
  const index = headers.findIndex((h) => h.key === key);

  // If the header is found, update it
  if (index !== -1) headers[index] = { key, value };
  // Otherwise, add the header
  else headers.push({ key, value });

  // Return the headers
  return headers;
}

/**
 * Delete a header from the headers
 * @param headers Headers object
 * @param key Header key
 * @returns Headers object without the specified header
 */
export function delHeaders(headers: ExtraHeaders, key: string) {
  // Find the header by key
  const index = headers.findIndex((h) => h.key === key);
  // If the header is found, delete it
  if (index !== -1) headers.splice(index, 1);
  // Return the headers
  return headers;
}
