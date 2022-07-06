// @ts-check
import shell from 'shelljs'
import chalk from 'chalk';
import fs from 'fs'
import { homedir } from 'os'

/** _dirname doesnt work with modules */
import { fileURLToPath } from 'url';
import path from 'path';
// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/***/

export const rootPath = __dirname;
// export const configPath = path.join(__dirname, "..", "gh-edu", "data", "data.json");
const configDir = path.join(homedir(), ".config", "gh-edu");
export const configPath = path.join(configDir, "data.json");

export const updateJSON = (content) => {
  fs.writeFileSync(configPath, JSON.stringify(content, null, 2));
}

// Run any terminal command
export const runCommand = (command, silent = false) => {
  const result = shell.exec(command, { silent });
  if (result.code === 130) { // Kill signal
    console.log(chalk.yellow("Aborting"));
    process.exit(0);
  }
  if (result.code !== 0) {
    console.error("Internal error: runCommand: ", command);
    process.stderr.write(result.stderr);
    process.exit(1);
  }
  return result.stdout;
};

export const executeQuery = (query, ...options) => {
  let command = `gh api graphql --paginate ${options} -f query='${query}'`;
  let queryResult = shell.exec(command, { silent: true });
  if (queryResult.code !== 0) {
    let message = "Internal error: executeQuery\ncommand:\n"
    message += queryResult.stderr
    // console.error("Internal error: executeQuery.");
    // console.error("command: ", command);
    // process.stderr.write(queryResult.stderr);
    // process.exit(1);
    throw message
  }
  return queryResult.stdout;
};
