import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist", "ios", "node_modules", "supabase/functions",
      // old Lovable leftovers — safe to delete (see README)
      "week-eat-tracker", "week-eat-tracker-2", "_backup", "tailwind.config.ts", "src/components/ui",
      "src/integrations", "src/hooks", "src/components/IngredientItem.tsx", "src/components/LanguageSelector.tsx",
      "src/pages/NotFound.tsx", "src/lib/queryClient.ts", "src/lib/utils.ts", "src/lib/translations.ts",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    plugins: { "react-hooks": reactHooks, "react-refresh": reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
  // Context files export a Provider and its hook together — that's intended
  { files: ["src/contexts/**"], rules: { "react-refresh/only-export-components": "off" } },
);
