#!/usr/bin/env node
const path = require('path');
const root = path.resolve(__dirname, '..');
const { assertAppSourceSyntax } = require('./owcoach-app-source-utils.cjs');
const result = assertAppSourceSyntax(root);
if (result.script_count < 5) throw new Error(`too few inline scripts extracted: ${result.script_count}`);
if (result.byte_length < 1000000) throw new Error(`extracted app source is unexpectedly small: ${result.byte_length}`);
console.log('App source syntax static checks passed');
