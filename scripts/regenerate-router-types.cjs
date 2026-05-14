#!/usr/bin/env node
/**
 * Regenerates `.expo/types/router.d.ts` for expo-router typed routes.
 * Run after adding/moving routes: `npm run router:types`
 */
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.join(__dirname, '..');
const appRoot = path.join(projectRoot, 'app');
process.env.EXPO_ROUTER_APP_ROOT = appRoot;

const pony = require('expo-router/build/testing-library/require-context-ponyfill').default;
const { EXPO_ROUTER_CTX_IGNORE } = require('expo-router/_ctx-shared');
const { getTypedRoutesDeclarationFile } = require('expo-router/build/typed-routes/generate');

const ctx = pony(appRoot, true, EXPO_ROUTER_CTX_IGNORE);
const file = getTypedRoutesDeclarationFile(ctx, {});
if (!file) {
  console.error('expo-router: no typed routes output (getTypedRoutesDeclarationFile returned empty).');
  process.exit(1);
}

const out = path.join(projectRoot, '.expo/types/router.d.ts');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, file);
console.log('Wrote', out);
