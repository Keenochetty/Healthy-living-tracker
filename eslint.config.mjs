import { globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  globalIgnores([
    ".expo/**",
    ".next/**",
    "dist/**",
    "family-health-app/**",
    "node_modules/**",
    "out/**",
    "web-build/**"
  ]),
  ...nextVitals,
  {
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react/no-unescaped-entities": "off"
    }
  }
];

export default config;
