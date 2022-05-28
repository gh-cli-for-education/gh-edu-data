import path from 'path';
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import inquirer from 'inquirer'
import chalk from "chalk";

/** Load configuration */
import fs from 'fs'
const stringConfig = fs.readFileSync(__dirname + "/../../gh-edu/config.json", { encoding: "utf8" })
const config = JSON.parse(stringConfig);
/** END loadConfig */

const utility = import(__dirname + "/../../gh-edu/utils/utils.js");

const query = (org) => `
query {
  organization(login: "${org}") {
    teams(first: 100) {
      totalCount
      edges {
        node {
          name
          members(first: 100) {
            totalCount
            edges {
              memberAccessUrl
              node {
                name
                url
                email
              }
            }
          }
          url
        }
      }
    }
  }
}
`

function parse(teams) {
  let newTeams = [];
  for (const team of teams) {
    //console.log(team.name);
    if (team.totalCount > 1) {
      console.warn(chalk.yellow("Warning:", team.totalCount, "members in this team. Skip"));
      //console.log(team.url);
      continue;
    }
    let dataArr = team.name?.match(config?.teams?.regexp)
    if (!dataArr) continue;

    //console.log(JSON.stringify(dataArr, null, 2));

    // throw new Error if not regexp
  
    /*
    if (dataArr.length !== 3) {
      console.log(chalk.yellow("Warning: Wrong team name:", team.name, ". Skip"));
      console.log(team.url);
      continue;
    }
    */

    let tmp = team.member.url.split("/");
    let login = tmp[tmp.length - 1];
    let student = {
      idTeam: team.name,
      url: team.member.url,
      login: login,
    }; 
    if (team?.member?.email) student.email= team.member.email

    config?.teams?.fields?.forEach(([field, index]) =>  {
      //console.log(field, index);
      student[field] = dataArr[index] || "";
    });
    newTeams.push(student);
  }
  return newTeams;
}

export default async function team(options) {
  if (!config.defaultOrg) {
    console.error("Please set an organization as default")
    return;
  }
  const util = await utility;
  const filter = "--jq '[.data.organization.teams.edges[].node | {name, totalCount: .members.totalCount, url, member: {name: .members.edges[].node.name, url: .members.edges[].node.url, email: .members.edges[].node.email}}]'";
  const result = JSON.parse(util.executeQuery(query(config.defaultOrg), filter));
  if (result.length === 0) {
    console.error(chalk.red("No team in this organization :", config.defaultOrg));
    return 1;
  }
  const newTeams = parse(result);
  if (!options.output) {
    console.log(newTeams);
  } else {
    fs.writeFileSync(options.output, JSON.stringify(newTeams, null, 2));
  }
}
