import {
  type RouteConfig,
  route,
  index,
  layout,
  prefix,
} from "@react-router/dev/routes";

export default [
  index("routes/LandingPage.tsx"),
  // route("about", "routes/about.tsx"),

  layout("routes/AuthLayout.tsx", [
    route("login", "routes/auth/Login.tsx"),
    route("register", "routes/auth/Register.tsx"),
    route("forgot-password", "routes/auth/ForgotPassword.tsx"),
    route("reset-password", "routes/auth/ResetPassword.tsx"),
  ]),

  // ...prefix("concerts", [
  //   index("routes/concerts/home.tsx"),
  //   route(":city", "routes/concerts/city.tsx"),
  //   route("trending", "routes/concerts/trending.tsx"),
  // ]),
] satisfies RouteConfig;
