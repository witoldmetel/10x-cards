import type { ActionFunctionArgs } from "react-router";

export namespace Route {
  export type ActionArgs = ActionFunctionArgs;

  // Direct user data format
  export interface RegisterResponseDirect {
    id: string;
    email: string;
    token: string;
  }

  // Nested user data format
  export interface RegisterResponseNested {
    user: {
      id: string;
      email: string;
    };
    token: string;
  }

  export type RegisterResponse =
    | RegisterResponseDirect
    | RegisterResponseNested;
}
