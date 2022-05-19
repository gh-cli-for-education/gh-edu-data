import inquirer from 'inquirer';
import tmp from "tmp";

/** Load configuration */
import fs from 'fs'
const stringConfig = fs.readFileSync(process.cwd() + "/../gh-edu/config.json", { encoding: "utf8" })
const config = JSON.parse(stringConfig);
/** END loadConfig */

const utility = import(process.cwd() + "/../gh-edu/utils/utils.js");

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
  console.log("result: ", result);
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
  let { data: { organization: { membersWithRole: { nodes: remoteData } } } } = JSON.parse(util.executeQuery(query(config.defaultOrg, metaData.desiredData)));
  const oneLine = remoteData.map(data => data.login).join('\n');
  const tmpFile = tmp.tmpNameSync();
  fs.writeFileSync(tmpFile, JSON.stringify(remoteData, null, 2));
  for (const [index, member] of localData.entries()) {
    const prompt = `Member: ${member[metaData.name]} ID: ${member[metaData.id]} > `;
    let command = `echo "${oneLine}"` + `| fzf --ansi --prompt='${prompt}' --preview ` + `"cat ${tmpFile} | jq '.[] | select(.login==\\"{}\\")'"`;
    let result = util.runCommand(command).replace(/\s/g, ''); // TODO why do I need to do this?
    for (const [index, data] of remoteData.entries()) {
      if (data.login === result) {
      }
    }
    console.log("localData: ", localData);
  }
}

// export const chooseOrgName = "gh api --paginate /user/memberships/orgs  --jq '.[].organization.login' | fzf  --prompt='Choose an organization> ' --layout=reverse --border";
export default async function data(file) {
  if (!config.defaultOrg) {
    console.error("Please set an organization as default")
    return;
  }
  const fileString = fs.readFileSync(file, { encoding: "utf8" })
  const data = JSON.parse(fileString);
  // console.log("data: ", data);
  const metaData = await setMetadata(data);
  // console.log("metaData: ", metaData);
  if (check(data, metaData))
    return;
  fill(data, metaData);
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
