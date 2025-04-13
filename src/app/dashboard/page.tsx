import Navbar from "@/components/Navbar";
import { Button, Space, Empty } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import SpeechCard from "@/components/SpeechCard";

// Temporary mock data - replace with your actual data fetching logic
const mockSpeeches = [
  {
    id: "1",
    title: "Introduction to AI",
    description:
      "A comprehensive overview of artificial intelligence and its impact on modern technology. Exploring key concepts and future trends.",
    duration: 15,
    createdAt: "2024-03-20",
    category: "technical",
  },
  {
    id: "2",
    title: "Leadership in Crisis",
    description:
      "Strategies for effective leadership during challenging times. Learn how to guide your team through uncertainty and change.",
    duration: 20,
    createdAt: "2024-03-19",
    category: "business",
  },
  {
    id: "3",
    title: "Personal Growth",
    description:
      "Discover the key principles of personal development and how to achieve your goals through consistent self-improvement.",
    duration: 25,
    createdAt: "2024-03-18",
    category: "motivational",
  },
];

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Navbar />
        <main className="mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-16">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Speeches</h1>
            <Space>
              <Link href="/speech">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
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

          {mockSpeeches.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {mockSpeeches.map((speech) => (
                <SpeechCard key={speech.id} {...speech} />
              ))}
            </div>
          ) : (
            <Empty description="No speeches found" className="mt-8" />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
