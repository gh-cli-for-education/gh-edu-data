// @ts-check
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
const teamR = (config.teamR) ? new RegExp(config.teamR) : /(?<name>.+)[-_](?<id>.+)/; // TODO check regex

function parse(teams) {
  let singleTeams = [];
  let multipleTeams = Object.create(null);
  //console.error(JSON.stringify(teams, null, 2));
  for (const team of teams) {
    if (team.totalCount > 1) {
      if (!multipleTeams[team.name]) multipleTeams[team.name] = [];
      let set = new Set(multipleTeams[team.name]).add(team.member.url);
      multipleTeams[team.name] = [ ...set];
      continue;
    }
    //console.log(team.name);
    const result = teamR.exec(team.name);
    //console.log(result);
    if (!result?.groups) {
      console.error(`Warning! Regular expresion /${teamR.source}/ didn't match "${team.name}"`);
      //process.exit(1);
    } else {
      singleTeams.push(
        {
          url: team.member.url,
          email: team.member.email,
          nameInGH: team.member.name,
          ...result.groups
        }
      );
    }
  }
  if (Object.keys(multipleTeams).length > 0) {
    console.error(`Teams with several members: ${JSON.stringify(multipleTeams, null, 2)}`);
  }
  return singleTeams;
}

export default async function teams(options) {
  if (!config.defaultOrg) {
    console.error("Please set an organization as default")
    return;
  }
  const util = await utility;
  const filter = `--jq 
       '[
        .data.organization.teams.edges[].node | 
        {
            name, 
            totalCount: .members.totalCount, 
            url, 
            member: {
              name: .members.edges[].node.name, 
              url: .members.edges[].node.url, 
              email: .members.edges[].node.email
            }
          }
      ]'`.replace(/\s+/g, " ");
  //console.log(filter);
  const result = JSON.parse(util.executeQuery(query(config.defaultOrg), filter));
  //console.error(result);
  if (result.length === 0) {
    console.error("No team in this organization :", config.defaultOrg);
    return 1;
  }
  const singleTeams = parse(result);
  if (options.cache) {
    config.commands.data.teams = singleTeams;
    updateJSON(config);
    // return;
  }
  if (!options.output) {
    console.log(JSON.stringify(singleTeams, null, 2));
  } else {
    fs.writeFileSync(options.output, JSON.stringify(singleTeams, null, 2));
  }
}
