import { defineConfig, mergeConfig } from 'vitest/config';
import { createVitestConfig } from '@lynx-js/react/testing-library/vitest-config';
import tsconfigPaths from 'vite-tsconfig-paths';

const defaultConfig = await createVitestConfig();
const config = defineConfig({
  test: {},
  plugins: [tsconfigPaths()],
});

export default mergeConfig(defaultConfig, config);
