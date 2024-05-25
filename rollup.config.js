import typescript from "rollup-plugin-typescript2";

export default {
	input: "./src/main.ts",
	output: [
		{
			file: "./example/index.js",
			format: "esm",
			sourcemap: true,
		},
	],
	plugins: [
		typescript(),
	]
};