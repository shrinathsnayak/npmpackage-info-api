import { Response } from 'express';
import messages from '@/constants/messages';

/**
 * The `terminate` function in TypeScript is designed to gracefully shut down a server with optional
 * coredump and timeout settings.
 * @param {any} server - The `server` parameter in the `terminate` function is typically an instance of
 * a Node.js HTTP server. This server is responsible for handling incoming HTTP requests and sending
 * responses back to clients. When the `terminate` function is called, it will attempt to gracefully
 * shut down this server before exiting the process
 * @param options - The `options` parameter in the `terminate` function is an object with two
 * properties:
 * @returns A function that takes two parameters, `code` of type number and `reason` of type string,
 * and returns another function that takes two optional parameters, `err` of type Error and `promise`
 * of type Promise<unknown>.
 */
export const terminate = (
  server: any,
  options = { coredump: false, timeout: 500 }
) => {
  // Exit function
  const exit = () => {
    options.coredump ? process.abort() : process.exit();
  };

  return (code: number, reason: string) =>
    (err?: Error, promise?: Promise<unknown>) => {
      if (err && err instanceof Error) {
        console.error(
          `[terminate] ${reason}:`,
          err.stack || err.message || err
        );
      } else {
        console.error(`[terminate] ${reason} (no error object)`);
      }

      // Attempt a graceful shutdown
      server.close(() => exit());
      setTimeout(exit, options.timeout).unref();
    };
};

/**
 * The `tryCatchWrapper` function is a TypeScript wrapper that adds error handling to asynchronous
 * functions by catching and logging errors.
 * @param {T} fn - The `tryCatchWrapper` function is a higher-order function that takes a function `fn`
 * as its parameter. This function is designed to wrap asynchronous functions that return promises and
 * handle any errors that may occur during their execution.
 * @returns The `tryCatchWrapper` function is being returned. This function takes a function `fn` as an
 * argument and wraps it with a try-catch block to handle any errors that may occur when the original
 * function is called. If an error occurs, it logs the error to the console and returns an object with
 * a status code and a default error message.
 */
export const tryCatchWrapper = (fn: Function, functionName?: string) => {
  return async (...args: any[]) => {
    const startTime = Date.now();
    try {
      const result = await fn(...args);
      const duration = Date.now() - startTime;
      if (duration > 5000) { // Log slow operations
        console.warn(`Slow operation detected: ${functionName || fn.name} took ${duration}ms`);
      }
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`Error in ${functionName || fn.name}:`, {
        error: error.message,
        duration: `${duration}ms`,
        stack: error.stack
      });

      // Return graceful error response instead of throwing
      return {
        error: true,
        message: error.message || 'An error occurred',
        status: error.response?.status || 500
      };
    }
  };
};

/**
 * The function `handleMissingParameter` sends a response with a specified status code and message if a
 * parameter is missing.
 * @param {Response} res - The `res` parameter is of type `Response`, which is typically used in web
 * development to send a response back to the client in an HTTP request. It is commonly used in
 * frameworks like Express.js in Node.js to handle HTTP responses.
 * @param {number} [status=500] - The `status` parameter in the `handleMissingParameter` function is
 * used to specify the HTTP status code that will be sent in the response. If no status code is
 * provided when calling the function, it defaults to 500 (Internal Server Error).
 * @param {string} [message=Something went wrong] - The `message` parameter in the
 * `handleMissingParameter` function is a string that represents the error message to be sent in the
 * response when a parameter is missing. By default, if no message is provided when calling the
 * function, it will use the message 'Something went wrong'.
 * @returns A Response object is being returned with the specified status code and message.
 */
export const handleMissingParameter = (
  res: Response,
  status: number = 500,
  message: string = messages.errors.SOMETHING_WENT_WRONG
): Response => {
  return res.status(status).send({
    status: status,
    message: message
  });
};
