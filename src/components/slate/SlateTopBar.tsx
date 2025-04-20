import { useTheme } from "@/contexts/ThemeContext";
import { Speech } from "@/types/speech";
import {
  DeleteOutlined,
  EditOutlined,
  LineChartOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import Image from "next/image";
import Link from "next/link";

interface SlateTopBarProps {
  setCollapsed: (collapsed: boolean) => void;
  collapsed: boolean;
  setSpeechInfoModalOpen: (open: boolean) => void;
  setSpeechAnalysisDrawerOpen: (open: boolean) => void;
  setDeleteSpeechModalVisible: (visible: boolean) => void;
  speechData: Speech;
}

export default function SlateTopBar({
  setCollapsed,
  collapsed,
  setSpeechInfoModalOpen,
  setSpeechAnalysisDrawerOpen,
  setDeleteSpeechModalVisible,
  speechData,
}: SlateTopBarProps) {
  const { theme } = useTheme();

  return (
    <div
      className="fixed w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 z-20 top-0"
      style={{
        backgroundColor: theme === "dark" ? "#1e1e1e" : "#ffffff",
        borderBottom:
          theme === "dark" ? "solid 1px #2d2d2d" : "solid 1px #e5e5e5",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center space-x-1">
            <div className="flex items-center space-x-1">
              <Image src={"/logo.png"} alt="Logo" width={40} height={40} />
            </div>
          </Link>
          <Button
            icon={<MenuOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <div className="flex items-center gap-1">
            <div className="text-lg font-bold">{speechData.title}</div>
            <div className="ml-1">
              <Tooltip title="Edit">
                <Button
                  icon={<EditOutlined />}
                  onClick={() => setSpeechInfoModalOpen(true)}
                />
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => setDeleteSpeechModalVisible(true)}
          />
          <div className=" hidden lg:block">
            <Button
              className="primary-gradient"
              type="primary"
              icon={<LineChartOutlined />}
              onClick={() => setSpeechAnalysisDrawerOpen(true)}
            >
              Analyse
            </Button>
          </div>
          <div className="lg:hidden">
            <Button
              className="primary-gradient"
              type="primary"
              icon={<LineChartOutlined />}
              onClick={() => setSpeechAnalysisDrawerOpen(true)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
