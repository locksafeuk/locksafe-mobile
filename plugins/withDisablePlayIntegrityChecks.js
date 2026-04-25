const { createRunOncePlugin, withAppBuildGradle } = require('@expo/config-plugins');

const PLUGIN_NAME = 'with-disable-play-integrity-checks';
const PLUGIN_VERSION = '1.0.0';

const EXCLUDE_BLOCK = `configurations.configureEach {
    // Explicitly exclude Google Play licensing/integrity client artifacts.
    // This prevents Play Store-only validation activities (e.g. PairIP/LicenseActivity)
    // from being bundled when testing APKs outside Google Play.
    exclude group: "com.google.android.play", module: "integrity"
    exclude group: "com.google.android.play", module: "app-update"
    exclude group: "com.google.android.play", module: "review"
    exclude group: "com.google.android.vending", module: "licensing"
}

`;

function withDisablePlayIntegrityChecks(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language !== 'groovy') {
      return config;
    }

    const { contents } = config.modResults;

    if (contents.includes('module: "integrity"') || contents.includes("module: 'integrity'")) {
      return config;
    }

    const dependenciesAnchor = '\ndependencies {';
    const anchorIndex = contents.indexOf(dependenciesAnchor);

    if (anchorIndex === -1) {
      return config;
    }

    config.modResults.contents =
      contents.slice(0, anchorIndex) + EXCLUDE_BLOCK + contents.slice(anchorIndex);

    return config;
  });
}

module.exports = createRunOncePlugin(
  withDisablePlayIntegrityChecks,
  PLUGIN_NAME,
  PLUGIN_VERSION
);
