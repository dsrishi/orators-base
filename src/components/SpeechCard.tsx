"use client";

import { Card, Tag, Typography } from "antd";
import { ClockCircleOutlined, CalendarOutlined } from "@ant-design/icons";
import { useTheme } from "@/contexts/ThemeContext";
import Link from "next/link";

const { Text, Title } = Typography;

interface SpeechCardProps {
  id: string;
  title: string;
  description: string;
  duration: number;
  created_at: string;
  main_type: string;
}

export default function SpeechCard({
  id,
  title,
  description,
  duration,
  created_at,
  main_type,
}: SpeechCardProps) {
  const { theme } = useTheme();

  const getMainTypeColor = (main_type: string) => {
    const colors: { [key: string]: string } = {
      business: "blue",
      technical: "green",
      motivational: "orange",
      educational: "purple",
      other: "default",
    };
    return colors[main_type] || "default";
  };

  return (
    <Link href={`/speech?id=${id}`}>
      <Card
        hoverable
        style={{
          backgroundColor: theme === "dark" ? "#2d2d2d" : "#ffffff",
          borderColor: theme === "dark" ? "#3d3d3d" : "#e5e5e5",
        }}
        className="h-full"
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-start mb-2">
            <Title
              level={4}
              style={{
                color: theme === "dark" ? "#ffffff" : "#000000",
                margin: 0,
              }}
              className="line-clamp-1"
            >
              {title}
            </Title>
            <Tag color={getMainTypeColor(main_type)}>{main_type}</Tag>
          </div>

          <Text
            className="flex-grow mb-4 line-clamp-2"
            style={{ color: theme === "dark" ? "#999" : "#666" }}
          >
            {description}
          </Text>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2">
              <ClockCircleOutlined
                style={{ color: theme === "dark" ? "#999" : "#666" }}
              />
              <Text style={{ color: theme === "dark" ? "#999" : "#666" }}>
                {duration} min
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <CalendarOutlined
                style={{ color: theme === "dark" ? "#999" : "#666" }}
              />
              <Text style={{ color: theme === "dark" ? "#999" : "#666" }}>
                {new Date(created_at).toLocaleDateString()}
              </Text>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
