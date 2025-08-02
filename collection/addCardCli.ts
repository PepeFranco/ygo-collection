#!/usr/bin/env node
import { createCLI } from "./addCardCliImpl";

const cli = createCLI();
cli.startCli();