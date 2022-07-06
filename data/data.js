// @ts-check
import inquirer from 'inquirer';
import chalk from 'chalk';
import tmp from "tmp";
import path from 'path';

import { rootPath, configPath, runCommand, executeQuery, updateJSON } from '../utils.js'

/** Load configuration */
import fs from 'fs'
const stringConfig = fs.readFileSync(configPath, { encoding: "utf8" })
const config = JSON.parse(stringConfig);
/** END loadConfig */

/** @param data {any[]}*/
// get the commond fields of all the elements
function instersect(data) {
  let commonFields = Object.keys(data[0]);
  for (let i = 1; i < data.length; i++) {
    commonFields = commonFields.filter(field => field in data[i]);
  }
  return commonFields;
}

/** @param data {any[]}*/
async function setMetadata(data) {
  const fields = instersect(data);
  if (fields.length === 0) {
    console.error(chalk.red("All elements must have a commom field. Allegedly the student name"))
  }
  let questions = [
    {
      type: 'checkbox',
      name: 'desiredData',
      message: 'Select the data you want to get',
      choices: ['login', 'name', 'bio', 'email', 'url', 'avatarUrl']
    }
  ]
  let result = await inquirer.prompt(questions).then(answers => answers);
  questions = [
    {
      type: 'list',
      name: 'name',
      message: "Which field is the name?",
      choices: fields
    },
    {
      type: 'list',
      name: 'id',
      message: "Which field is the id?",
      choices: new Array(...fields, "[I am not using any kind of identifier]")
    }
  ];
  return await inquirer.prompt(questions).then(answers => (
    {
      ...answers,
      ...result,
    }
  ));
}

// login, name, bio, email, url, avatarUrl
const query = (org, node) => `
  query ($endCursor: String) {
  organization(login: "${org}") {
    membersWithRole(first: 100, after: $endCursor) {
      pageInfo {
        endCursor
        hasNextPage
      }
      nodes {
        ${node}
      }
    }
  }
}
`

// https://majiehong.com/post/2021-03-08_fzf_jq_play_locally/
async function fill(data, metaData) {
  // const util = await utility;
  const { data: { organization: { membersWithRole: { nodes: remoteData } } } } =
    JSON.parse(executeQuery(query(config.defaultOrg, metaData.desiredData)));
  const loginOneLine = remoteData.map(data => data.login).join('\n');
  const tmpFile = tmp.tmpNameSync();
  fs.writeFileSync(tmpFile, JSON.stringify(remoteData, null, 2));
  for (const [index, member] of data.entries()) {
    const prompt = `Member: ${member[metaData.name]} ID: ${member[metaData.id]} > `;
    // let command = `echo "${oneLine}"` + `| fzf --ansi --prompt='${prompt}' --preview ` + `"cat ${tmpFile} | jq -C '.[] | select(.login==\\"{}\\")'"`;
    let command = `echo "${loginOneLine}"` + `| fzf --ansi --prompt='${prompt}' --preview ` + `"cat ${tmpFile} | jq -C '.[] | select(.login==\\"{}\\")'"`;
    const selectedLogin = runCommand(command).replace(/\s/g, ''); // TODO handle signal C-D C-C
    const selectedData = JSON.parse(runCommand(`cat ${tmpFile} | jq '.[] | select(.login==\"${selectedLogin}\")'`, true));
    for (const field in selectedData) {
      data[index][field] = selectedData[field];
    }
  }
  return data;
}

export default async function data(file, options) {
  if (!config.defaultOrg) {
    console.error("Please set an organization as default")
    return;
  }
  let outputFile = options.output;
  const fileString = fs.readFileSync(file, { encoding: "utf8" })
  const inputData = JSON.parse(fileString);
  const metaData = await setMetadata(inputData);
  const result = await fill(inputData, metaData);
  if (options.outputFile)
    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
  else
    console.log(result);
  if (options.cache) {
    config.commands.data.log = result;
    updateJSON(config);
  }
}

