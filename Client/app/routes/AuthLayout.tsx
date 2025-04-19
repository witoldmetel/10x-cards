import React from "react";
import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="max-w-7xl mx-auto">
      <Outlet />
    </div>
  );
}
