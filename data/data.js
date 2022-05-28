import path from 'path';
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import inquirer from 'inquirer';
import chalk from 'chalk';
import tmp from "tmp";

/** Load configuration */
import fs from 'fs'
const stringConfig = fs.readFileSync(__dirname + "/../../gh-edu/config.json", { encoding: "utf8" })
const config = JSON.parse(stringConfig);
/** END loadConfig */

const utility = import(__dirname + "/../../gh-edu/utils/utils.js");

/** @param questions {any[]}*/
async function setMetadata(data) {
  const fields = Object.keys(data[0]);
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
      choices: fields
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
async function fill(localData, metaData) {
  const util = await utility;
  const { data: { organization: { membersWithRole: { nodes: remoteData } } } } = JSON.parse(util.executeQuery(query(config.defaultOrg, metaData.desiredData)));
  const oneLine = remoteData.map(data => data.login).join('\n');
  const tmpFile = tmp.tmpNameSync();
  fs.writeFileSync(tmpFile, JSON.stringify(remoteData, null, 2));
  for (const [index, member] of localData.entries()) {
    const prompt = `Member: ${member[metaData.name]} ID: ${member[metaData.id]} > `;
    let command = `echo "${oneLine}"` + `| fzf -m --ansi --prompt='${prompt}' --preview ` + `"cat ${tmpFile} | jq -C '.[] | select(.login==\\"{}\\")'"`;
    const selectedLogin = util.runCommand(command).replace(/\s/g, ''); // TODO handle signal C-D C-C
    const selectedData = JSON.parse(util.runCommand(`cat ${tmpFile} | jq '.[] | select(.login==\"${selectedLogin}\")'`, true));
    for (const field in selectedData) {
      if (field in localData[index]) {
        // TODO warning. make an alias to don't overwrite original data
      }
      localData[index][field] = selectedData[field];
    }
  }
  return localData;
}

export default async function data(file, options) {
  if (!config.defaultOrg) {
    console.error("Please set an organization as default")
    return;
  }
  let outputFile = options.output;
  if (!options.output) {
    console.log(chalk.yellow("Warning you are not using --output. The input file will be overwrite"));
    outputFile = file;
  }
  const fileString = fs.readFileSync(file, { encoding: "utf8" })
  const data = JSON.parse(fileString);
  const metaData = await setMetadata(data);
  if (check(data, metaData))
    return;
  const result = await fill(data, metaData);
  fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
  console.log("Done!!!");
}

function check(data, metaData) {
  for (const member of data) {
    if (!member[metaData.name]) {
      console.error(`Field ${metaData.name} is required`);
      return 1;
    }
  }
  return 0;
}
