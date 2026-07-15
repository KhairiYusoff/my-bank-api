const YAML = require("yamljs");
const path = require("path");

const swaggerDir = path.join(__dirname, "../shared/swagger");

const base = YAML.load(path.join(swaggerDir, "openapi.yaml"));

const features = [
  "auth",
  "admin",
  "onboarding",
  "accounts",
  "transactions",
  "expenses",
  "users",
  "ai",
  "audit",
];

const spec = {
  ...base,
  servers: [
    {
      url: process.env.API_BASE_URL || "http://localhost:5001/api",
      description: "Active server",
    },
  ],
  tags: [],
  paths: {},
};

for (const feature of features) {
  const featureSpec = YAML.load(path.join(swaggerDir, `${feature}.yaml`));
  if (featureSpec.tags) spec.tags.push(...featureSpec.tags);
  if (featureSpec.paths) Object.assign(spec.paths, featureSpec.paths);
}

module.exports = spec;
