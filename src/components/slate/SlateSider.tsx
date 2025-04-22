import { SpeechVersion } from "@/types/speech";
import SlateVersions from "./SlateVersions";
import {
  EditOutlined,
  HistoryOutlined,
  MessageOutlined,
  SnippetsOutlined,
} from "@ant-design/icons";
import { useTheme } from "@/contexts/ThemeContext";
import SlateAIChat from "./SlateAIChat";
import SlateTemplates from "./SlateTemplates";
import SlateSiderMenu from "./SlateSiderMenu";

interface SlateSiderProps {
  versions: SpeechVersion[];
  selectedVersion: SpeechVersion;
  setSelectedVersion: (version: SpeechVersion) => void;
  handleVersionChange: (key: string) => void;
  refreshSpeechData: () => Promise<void>;
  speechId: string;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  structuredViewOpen: boolean;
  setStructuredViewOpen: (open: boolean) => void;
  collapsedMenu: Tab;
  setCollapsedMenu: (collapsed: Tab) => void;
}

type Tab = "versions" | "chat" | "templates" | "editor";

export default function SlateSider({
  versions,
  selectedVersion,
  setSelectedVersion,
  handleVersionChange,
  refreshSpeechData,
  speechId,
  collapsed,
  setCollapsed,
  structuredViewOpen,
  setStructuredViewOpen,
  collapsedMenu,
  setCollapsedMenu,
}: SlateSiderProps) {
  const { theme } = useTheme();

  const tabs = [
    {
      id: "versions" as Tab,
      icon: <HistoryOutlined />,
      label: "Versions",
    },
    {
      id: "chat" as Tab,
      icon: <MessageOutlined />,
      label: "AI Chat",
    },
    {
      id: "templates" as Tab,
      icon: <SnippetsOutlined />,
      label: "Templates",
    },
    {
      id: "editor" as Tab,
      icon: <EditOutlined />,
      label: "Editor",
    },
  ];

  return (
    <div>
      {!collapsed && (
        <>
          <div
            style={{
              backgroundColor: theme === "dark" ? "#1f1f1f" : "#ffffff",
              borderBottom:
                theme === "dark"
                  ? "solid 0.5px #2d2d2d"
                  : "solid 0.5px #e5e5e5",
            }}
          >
            <div className="flex justify-around">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setCollapsedMenu(tab.id);
                  }}
                  className={`flex-1 p-3 text-center cursor-pointer ${
                    collapsedMenu === tab.id
                      ? "border-b-2 border-purple-500"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                  title={tab.label}
                >
                  {tab.icon}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {collapsedMenu === "versions" && (
              <SlateVersions
                versions={versions}
                selectedVersion={selectedVersion}
                setSelectedVersion={setSelectedVersion}
                handleVersionChange={handleVersionChange}
                refreshSpeechData={refreshSpeechData}
                speechId={speechId}
                setCollapsed={setCollapsed}
              />
            )}
            {collapsedMenu === "chat" && <SlateAIChat />}
            {collapsedMenu === "templates" && <SlateTemplates />}
            {collapsedMenu === "editor" && (
              <SlateSiderMenu
                structuredViewOpen={structuredViewOpen}
                setStructuredViewOpen={setStructuredViewOpen}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
