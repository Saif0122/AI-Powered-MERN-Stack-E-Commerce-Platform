/**
 * Wraps an async route handler so that any rejected promise or thrown error
 * is forwarded to Express's next() without needing try/catch in every handler.
 *
 * @param {Function} fn - Async express route handler.
 * @returns {Function} Express middleware function.
 *
 * @example
 * router.get('/', asyncHandler(async (req, res) => {
 *   const data = await SomeModel.find();
 *   res.json(data);
 * }));
 */
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
