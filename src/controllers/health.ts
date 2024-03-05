/**
 * The `getHealth` function returns an object with uptime, message, and date properties in TypeScript.
 * @returns The `getHealth` function is returning an object with three properties:
 * 1. `uptime`: The current uptime of the Node.js process.
 * 2. `message`: A string value of 'Ok'.
 * 3. `date`: A Date object representing the current date and time.
 */
export const getHealth = () => {
  return {
    uptime: process.uptime(),
    message: 'Ok',
    date: new Date()
  };
};