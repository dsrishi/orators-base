import { Speech } from "@/types/speech";
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  LineChartOutlined,
  MenuOutlined,
  MoreOutlined,
  ShareAltOutlined,
  SoundOutlined,
} from "@ant-design/icons";
import { Button, Divider, Dropdown, MenuProps } from "antd";
import Link from "next/link";
import { ThemeSwitcher2 } from "../ThemeSwitcher";

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
  const items: MenuProps["items"] = [
    {
      key: "delete",
      label: (
        <div
          onClick={() => setDeleteSpeechModalVisible(true)}
          className="flex items-center gap-2 text-red-500"
        >
          <DeleteOutlined /> Delete Speech
        </div>
      ),
    },
    {
      key: "share",
      label: (
        <div className="flex items-center gap-2">
          <ShareAltOutlined /> Share
        </div>
      ),
    },
    {
      key: "download",
      label: (
        <div className="flex items-center gap-2">
          <DownloadOutlined /> Download
        </div>
      ),
    },
    {
      key: "theme",
      label: <ThemeSwitcher2 />,
    },
  ];

  return (
    <div className="fixed w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 z-20 top-0 primary-gradient shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <div className="text-2xl text-white font-logo">OratorsBase</div>
          </Link>
          <Button
            className="transparent-btn"
            icon={<MenuOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <Divider type="vertical" style={{ backgroundColor: "#aaa" }} />
          <div className="flex items-center gap-1">
            <div className="text-white">{speechData.title}</div>
            <div className="ml-1">
              <Button
                className="transparent-btn"
                icon={<EditOutlined />}
                onClick={() => setSpeechInfoModalOpen(true)}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className=" hidden lg:block">
            <Button className="transparent-btn" icon={<SoundOutlined />}>
              Rehearse
            </Button>
          </div>
          <div className="lg:hidden">
            <Button className="transparent-btn" icon={<SoundOutlined />} />
          </div>
          <div className=" hidden lg:block">
            <Button
              style={{
                border: "none",
                backgroundColor: "white",
                color: "black",
              }}
              icon={<LineChartOutlined />}
              onClick={() => setSpeechAnalysisDrawerOpen(true)}
            >
              Analyse
            </Button>
          </div>
          <div className="lg:hidden">
            <Button
              style={{ border: "none" }}
              icon={<LineChartOutlined />}
              onClick={() => setSpeechAnalysisDrawerOpen(true)}
            />
          </div>

          <Dropdown
            menu={{ items }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <Button className="transparent-btn" icon={<MoreOutlined />} />
          </Dropdown>
        </div>
      </div>
    </div>
  );
}
