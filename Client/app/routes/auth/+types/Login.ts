import type { ActionFunctionArgs } from "react-router";

export namespace Route {
	export type ActionArgs = ActionFunctionArgs;

	export interface LoginResponse {
		user: {
			id: string;
			email: string;
		};
		token: string;
	}
}
