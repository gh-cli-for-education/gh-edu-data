/** _dirname doesnt work with modules */
import { fileURLToPath } from 'url';
import path from 'path';
// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/***/

export const rootPath = __dirname;
export const configPath = path.join(__dirname, "..", "gh-edu", "data", "data.json");
