import { DashboardOutlined } from "@ant-design/icons";
import { Button } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";

const WebNavBar = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const router = useRouter();

  // Handlers
  const handleLogin = () => router.push("/login");
  const handleRequestAccess = () => router.push("/request-access");
  const handleDashboard = () => router.push("/dashboard");

  return (
    <nav className="fixed top-0 left-0 z-50 w-full flex items-center justify-between px-8 py-4 shadow-lg primary-gradient">
      <Link href="/" className="flex items-center space-x-1">
        <div className="text-2xl text-white font-logo">OratorsBase</div>
      </Link>
      <div className="flex items-center gap-4">
        {!isLoggedIn && (
          <>
            <Button className="transparent-btn" onClick={handleLogin}>
              Login
            </Button>
            <Button
              style={{
                border: "none",
                backgroundColor: "white",
                color: "black",
              }}
              onClick={handleRequestAccess}
            >
              Request Access
            </Button>
          </>
        )}
        {isLoggedIn && (
          <Button
            style={{
              border: "none",
              backgroundColor: "white",
              color: "black",
            }}
            icon={<DashboardOutlined style={{ fontSize: 20 }} />}
            onClick={handleDashboard}
          >
            Dashboard
          </Button>
        )}
      </div>
    </nav>
  );
};

export default WebNavBar;
