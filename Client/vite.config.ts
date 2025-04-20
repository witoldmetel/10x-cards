import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
	plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
	server: {
		port: 3000,
		host: true,
		proxy: {
			"/api": {
				target: "http://localhost:5001",
				changeOrigin: true,
			},
		},
	},
	optimizeDeps: {
		exclude: ["lucide-react"],
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./app"),
		},
	},
});
