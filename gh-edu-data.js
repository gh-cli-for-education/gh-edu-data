import { program } from "commander"
import data from './data/data.js'
import teams from './teams/teams.js'
import addTeam from './add-team/add-team.js'

program
  .command("log")
  .description("Get relevant information about you students")
  .argument("<inputFile>")
  .option("-o, --output <outputFile>", "File to write the resulting data. If not specified it will write the result to the standard output")
  .option("-c, --cache", "Cache the information in the configuration file")
  .option("-q, --quiet", "Don't show any output, except errors")
  .action((file, options) => {
    data(file, options);
  })

program
  .command("teams")
  .description("Get relevant information about you students using teams")
  .option("-o, --output <outputFile>", "File to write the resulting data. If not specified it will write the result to the standard output")
  .option("-c, --cache", "Cache the information in the configuration file")
  .option("-q, --quiet", "Don't show any output, except errors")
  .action((options) => {
    teams(options);
  })
program
  .command("team-add")
  .action(() => {
    addTeam();
  })
program.parse();

