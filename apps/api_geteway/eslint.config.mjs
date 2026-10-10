import baseConfig from "../../eslint.config.mjs";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export default [
    ...baseConfig
];
