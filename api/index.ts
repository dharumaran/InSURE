/**
 * Vercel runs Express when the default export is the `app` (see Vercel KB: Using Express with Vercel).
 * Do not use serverless-http here — it can hang on this runtime.
 */
import { createApp } from '../services/api/src/app.js'

const app = createApp()
export default app
