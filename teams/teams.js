// @ts-check
import chalk from "chalk";

import { rootPath, configPath, updateJSON } from '../utils.js'

/** _dirname doesnt work with modules */
import { fileURLToPath } from 'url';
import path from 'path';
// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/***/

/** Load configuration */
import fs from 'fs'
const stringConfig = fs.readFileSync(configPath, { encoding: "utf8" })
const config = JSON.parse(stringConfig);
/** END loadConfig */

const utility = import(path.join(rootPath, "..", "gh-edu", "js", "utils", "utils.js"));

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
    if (team.totalCount > 1) {
      console.log(chalk.yellow("Warning:", team.totalCount, "members in this team. Skip"));
      console.log(team.url);
      continue;
    }
    const teamR = (config.teamR) ? new RegExp(config.teamR) : /(?<name>.*?)\.(?<id>.*?)\.(?<login>.*[^\s*])/; // TODO check regex
    const result = teamR.exec(team.name);
    if (!result?.groups) {
      console.error("Regular expresion ${teamR.source} didn't match anything or there is no groups name");
      process.exit(1);
    }
    newTeams.push(
      {
        url: team.member.url,
        email: team.member.email,
        ...result.groups
      }
    );
  }
  return newTeams;
}

export default async function teams(options) {
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
  if (options.cache) {
    config.commands.data.teams = newTeams;
    updateJSON(config);
    // return;
  }
  if (!options.output) {
    console.log(newTeams);
  } else {
    fs.writeFileSync(options.output, JSON.stringify(newTeams, null, 2));
  }
}
