import WS, { ClientOptions } from "ws";
import fetch, { Response, RequestInit } from "node-fetch";

import { decodeCookie, encodeCookie } from "./cookie";
import { joinURL, isAbsolute, encodeQuery } from "./url";
import { getHeaders, setHeaders, delHeaders } from "./headers";

// Types
export type DecodeCookie = { [key: string]: string };
export type ExtraHeaders = {
  key: string;
  value: string | (() => string | undefined);
}[];
export type ExtraHeadersRaw = { [key: string]: string };
export type ResponseHook = (
  res: Response,
  url: string,
  init?: RequestInit
) => Promise<void | Response> | void | Response;
export { Response };

// Interfaces for the Client class
export interface InitWS extends ClientOptions {
  params?: { [key: string]: any };
}
export interface InitRequest extends RequestInit {
  params?: { [key: string]: any };
}

/**
 * Class for working with the site
 */
export default class Client {
  /**
   * Convert object to form data format
   * @param body source object
   * @param init request options
   * @returns request options with form data
   */
  static formData(
    body: { [key: string]: any },
    init?: InitRequest
  ): InitRequest {
    const data = [];
    for (let key in body) data.push(key + "=" + body[key]);

    return {
      ...init,
      body: encodeURI(data.join("&")),
      headers: {
        ...init?.headers,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };
  }

  /**
   * Create a new instance of the Client class
   * @param origin Link to the site, for example http://example.com
   */
  constructor(private origin: string) {
    // Check the origin for correctness
    if (!isAbsolute(origin)) throw new Error("origin must be an absolute path");

    // Set the origin in the headers
    this.origin = new URL(origin).origin;
    this.headers.set("Origin", this.origin);
    this.headers.set("Referer", this.origin);
    this.headers.set("Cookie", () => this.cookie.get());
  }

  // Work with cookies
  private _cookie: DecodeCookie = {};
  public cookie = {
    get: () => {
      return encodeCookie(this._cookie);
    },
    set: (cookie?: string[]) => {
      for (let { key, val } of decodeCookie(cookie) ?? [])
        this._cookie[key] = val;

      return this.cookie.get();
    },
  };

  // Work with headers
  private _headers: ExtraHeaders = [];
  public headers = {
    get: () => {
      return getHeaders(this._headers);
    },
    set: (key: string, value: string | (() => string | undefined)) => {
      this._headers = setHeaders(this._headers, key, value);
      return this.headers.get();
    },
    del: (key: string) => {
      this._headers = delHeaders(this._headers, key);
      return this.headers.get();
    },
  };

  // Work with main path
  private _path = "/";
  public path = {
    get: () => {
      return this._path;
    },
    set: (path: string) => {
      if (isAbsolute(path)) throw new Error("path must be relative to origin");
      this._path = path;

      return this.path.get();
    },
  };

  // Response hooks
  private _responseHook: ResponseHook = async () => void 0;
  public onResponse(hook: ResponseHook) {
    this._responseHook = hook;
  }

  /**
   * Join the path to the origin
   * @param paths Path to the required resource
   * @returns Full path to the resource
   */
  public join(...paths: string[]) {
    return joinURL(this.origin, this.path.get(), ...paths);
  }

  public ws(url: string, init?: InitWS) {
    if (!isAbsolute(url)) url = this.join(url);
    if (init?.params) url += encodeQuery(init.params);

    return new WS(url.replace("http", "ws"), {
      ...init,
      headers: {
        ...init?.headers,
        ...this.headers.get(),
      },
    });
  }

  /**
   * Method for make request to the site
   * @param url relative path to the resource
   * @param init request options
   * @returns response
   */
  public async request(url: string, init?: InitRequest): Promise<Response> {
    // If the path is not absolute, then add the origin to it
    if (!isAbsolute(url)) url = this.join(url);
    // If there are parameters, then add them to the path
    if (init?.params) url += encodeQuery(init.params);

    // Make a request
    let res = await fetch(url, {
      ...init,
      headers: {
        ...this.headers.get(),
        ...init?.headers,
      },
    });
    // Run response hook
    const hook = await this._responseHook(res, url, init);
    // If the hook returns a response, then save it
    if (hook instanceof Response) res = hook;
    // If the request was unsuccessful, then throw an error
    if (!res.ok) {
      throw new Error(
        "Fetch failed.\n\t- url: " + url + "\n\t- status: " + res.status
      );
    }

    // Save cookies (if any)
    this.cookie.set(res.headers.raw()?.["set-cookie"]);
    // Return the response
    return res;
  }

  /**
   * Get request
   * @param url relative path to the resource
   * @param init request options
   * @returns response
   */
  public get(url: string, init?: Omit<InitRequest, "method">) {
    // Make a request with the GET method
    return this.request(url, { ...init, method: "get" });
  }

  /**
   * Post request
   * @param url relative path to the resource
   * @param init request options
   * @returns response
   */
  public post(url: string, init?: Omit<InitRequest, "method">) {
    // Make a request with the POST method
    return this.request(url, { ...init, method: "post" });
  }
}
