import chalk from "chalk";

/** Load configuration */
import fs from 'fs'
const stringConfig = fs.readFileSync(process.cwd() + "/../gh-edu/config.json", { encoding: "utf8" })
const config = JSON.parse(stringConfig);
/** END loadConfig */

const utility = import(process.cwd() + "/../gh-edu/utils/utils.js");

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
    let dataArr = team.name.split('.')
    if (dataArr.length !== 3) {
      console.log(chalk.yellow("Warning: Wrong team name:", team.name, ". Skip"));
      console.log(team.url);
      continue;
    }
    newTeams.push(
      {
        name: dataArr[0].replaceAll(/[-_]/g, " "),
        id: dataArr[1],
        login: dataArr[2],
        url: team.member.url,
        email: team.member.email
      }
    );
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
