import { program } from "commander"
import data from './data/data.js'

program
  .description("Save some data about your users")
  .argument("<file>")
  .action((file) => {
    data(file);
  })
program.parse();
