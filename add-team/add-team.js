import inquirer from 'inquirer'

import { rootPath, configPath } from '../utils.js'
import path from 'path';

const utility = import(path.join(rootPath, "..", "gh-edu", "js", "utils", "utils.js"));

import shell from "shelljs";
/** Load configuration */
import fs from 'fs'
import chalk from 'chalk';
const stringConfig = fs.readFileSync(configPath, { encoding: "utf8" })
const config = JSON.parse(stringConfig);
/** END loadConfig */

const getGroupNames = function(myTokens) {
  return myTokens.match(/(?<=\(\?<).*?(?=\>)/g);
}

async function noRegex() {
  let questions = [
    {
      type: 'input',
      name: 'name',
      message: 'Write your name'
    },
    {
      type: 'input',
      name: 'identifier',
      message: 'Write your identifier'
    }
  ]
  let result = await inquirer.prompt(questions);
  result.name = result.name.trim().replaceAll(" ", "-");
  const util = await utility;
  result.login = JSON.parse(util.runCommand("gh api user", true)).login;
  return [result.name, result.identifier, result.login].join(".");
}

async function getName(options) {
  if (config.teamR === "") {
    console.error(chalk.red("Set an teamR field, or use -r flag"));
    process.exit(1);
  }
  const fields = getGroupNames(config.teamR);
  let questions = [];
  for (const field of fields) {
    questions.push({
      type: 'input',
      name: field,
      message: 'Write the ' + field
    })
  }
  let result = await inquirer.prompt(questions);
  const separator = options.separator || (await inquirer.prompt([
    {
      type: 'input',
      name: 'separator',
      message: 'What is the separator between fields?'
    }
  ])).separator
  result = result.map(replaceAll(' ', '-'));
  return result.join(separator);
}

export default async function add_team(options) {
  if (!config.defaultOrg) {
    console.error("Please set an organization as default")
    return;
  }
  let teamName;
  if (options.regular) {
    teamName = await noRegex();
  } else {
    teamName = await getName(options);
  }
  const result = shell.exec(`gh api --method POST -H "Accept: application/vnd.github.v3+json" /orgs/${config.defaultOrg}/teams -f name="${teamName}"`, { silent: true });
  if (result.code !== 0) {
    const util = await utility;
    console.error(util.beautify(result.stdout));
    console.error(result.stderr);
    return result.code
  }
  // console.log("Team created!!!");
}
