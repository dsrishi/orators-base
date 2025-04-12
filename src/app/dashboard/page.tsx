import Navbar from "@/components/Navbar";
import { Button, Space } from "antd";
import { LineChartOutlined } from "@ant-design/icons";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Navbar />
        <main className="mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-16">
          {/* Add your dashboard content here */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Speeches</h1>
            <Space>
              <Link href="/speech">
                <Button
                  type="primary"
                  icon={<LineChartOutlined />}
                  style={{
                    background: "linear-gradient(to right, #5f0f40, #310e68)",
                    border: "none",
                    boxShadow: "none",
                  }}
                >
                  New Speech
                </Button>
              </Link>
            </Space>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
