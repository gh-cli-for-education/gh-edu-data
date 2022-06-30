import inquirer from 'inquirer'

import { rootPath, configPath } from '../utils.js'
import path from 'path';

const utility = import(path.join(rootPath, "..", "gh-edu", "js", "utils", "utils.js"));

import shell from "shelljs";
/** Load configuration */
import fs from 'fs'
const stringConfig = fs.readFileSync(configPath, { encoding: "utf8" })
const config = JSON.parse(stringConfig);
/** END loadConfig */

async function getName() {
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

export default async function add_team() {
  if (!config.defaultOrg) {
    console.error("Please set an organization as default")
    return;
  }
  const teamName = await getName();
  const result = shell.exec(`gh api --method POST -H "Accept: application/vnd.github.v3+json" /orgs/${config.defaultOrg}/teams -f name="${teamName}"`, {silent: true});
  if (result.code !== 0) {
    const util = await utility;
    console.error(util.beautify(result.stdout));
    console.error(result.stderr);
    return result.code
  }
  console.log("Team created!!!");
}
