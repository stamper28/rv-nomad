const { withGradleProperties } = require("expo/config-plugins");

/**
 * Custom config plugin to force android.minSdkVersion = 24 in gradle.properties.
 * This ensures the EAS build uses API 24+ which is required by React Native 0.81's
 * Hermes engine and native libraries (react-native-screens, expo-modules-core).
 */
function withMinSdk(config) {
  return withGradleProperties(config, (config) => {
    const props = config.modResults;

    // Remove any existing android.minSdkVersion entry
    const filtered = props.filter(
      (item) => !(item.type === "property" && item.key === "android.minSdkVersion")
    );

    // Add our forced value
    filtered.push({
      type: "property",
      key: "android.minSdkVersion",
      value: "24",
    });

    config.modResults = filtered;
    return config;
  });
}

module.exports = withMinSdk;
