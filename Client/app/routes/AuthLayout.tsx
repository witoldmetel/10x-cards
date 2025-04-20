import { Outlet } from "react-router";

export default function AuthLayout() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
			<Outlet />
		</div>
	);
}
