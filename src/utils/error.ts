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
        // Log error information, use a proper logging library here :)
        console.log(err.message, err.stack);
      }

      // Attempt a graceful shutdown
      server.close(() => exit());
      setTimeout(exit, options.timeout).unref();
    };
};
