import { FlatCompat } from "@eslint/eslintrc";
import path from "node:path";
import { fileURLToPath } from "node:url";

const directory = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: directory });

const threePackages = [
  "three",
  "three/*",
  "@react-three/fiber",
  "@react-three/fiber/*",
  "@react-three/drei",
  "@react-three/drei/*",
  "@react-three/postprocessing",
  "@react-three/postprocessing/*",
  "postprocessing",
  "postprocessing/*",
  "three-custom-shader-material",
  "three-custom-shader-material/*",
];

const eslintConfig = [
  { ignores: [".next/**", "node_modules/**", "out/**", "build/**", "next-env.d.ts"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["components/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: threePackages,
              message: "The Vital DOM layer must not import Three.js or React Three Fiber modules.",
            },
            {
              group: ["@/components/{canvas,twin,viz}", "@/components/{canvas,twin,viz}/**"],
              message: "The Vital DOM layer communicates with 3D only through the shared store or View refs.",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "components/canvas/**/*.{ts,tsx}",
      "components/twin/**/*.{ts,tsx}",
      "components/viz/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/components/ui", "@/components/ui/**"],
              message: "Three.js layers must not import components from the Vital DOM layer.",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
