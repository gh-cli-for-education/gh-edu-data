import { program } from "commander"
import data from './data/data.js'
import team from './team/team.js'
import addTeam from './add-team/add-team.js'

program
  .command("log")
  .description("Save some data about your users")
  .argument("<inputFile>")
  .option("-o, --output <outputFile>", "File to write the resulting data")
  .action((file, options) => { // TODO add quiet option
    data(file, options);
  })

program
  .command("team")
  .option("-o, --output <outputFile>", "File to write the resulting data")
  .option("-c, --cache", "Cache the information in the configuration file")
  .option("-q, --quit", "Don't show any output, except errors")
  .action((options) => {
    team(options);
  })
program
  .command("team-add")
  .action(() => {
    addTeam();
  })
program.parse();

