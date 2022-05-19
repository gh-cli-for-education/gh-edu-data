import { program } from "commander"
import data from './data/data.js'

program
  .description("Save some data about your users")
  .argument("<inputFile>")
  .option("-o, --output <outputFile>", "File to write the resulting data")
  .action((file, options) => { // TODO add quit option
    data(file, options);
  })
program.parse();
