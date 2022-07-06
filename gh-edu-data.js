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
  .description("Create teams with certain patterns to get information later on. Empty spaces will become '-'")
  .option("-r, --regular", "Don't use teamR. Use the common pattern: <name>.<id>.<login>. login is automatic")
  .option("-s, --separator <separator>", "Separator to use between fields. Ignored if used with -r flag")
  .action((options) => {
    addTeam(options);
  })
program.parse();

