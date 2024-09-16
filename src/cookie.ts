/**
 * Decode cookie string into object
 * @param cookie Array of cookie strings
 * @returns Array of cookie objects
 */
export function decodeCookie(cookie?: string[]) {
  return cookie
    ?.map((cookie) => cookie.substring(0, cookie.indexOf(";")))
    .map((cookie) => {
      const i = cookie.indexOf("=");
      const key = cookie.substring(0, i);
      const val = cookie.substring(i + 1);

      return { key, val };
    });
}

/**
 * Encode cookie object into string
 * @param cookie Object with cookie files
 * @returns String with cookie files
 */
export function encodeCookie(cookie: { [key: string]: string }) {
  const cookies = [];
  for (let name in cookie) cookies.push(name + "=" + cookie[name]);

  return cookies.join("; ");
}
