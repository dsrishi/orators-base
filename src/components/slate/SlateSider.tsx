import { SpeechFile } from "@/types/speech";
import {
  EditOutlined,
  FolderOutlined,
  SnippetsOutlined,
} from "@ant-design/icons";
import { useTheme } from "@/contexts/ThemeContext";
import SlateTemplates from "./SlateTemplates";
import SlateSiderMenu from "./SlateSiderMenu";
import SlateFiles from "./SlateFiles";

interface SlateSiderProps {
  files: SpeechFile[];
  selectedFile: SpeechFile;
  setSelectedFile: (file: SpeechFile) => void;
  handleFileChange: (key: string) => void;
  refreshSpeechData: () => Promise<void>;
  speechId: string;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  structuredViewOpen: boolean;
  setStructuredViewOpen: (open: boolean) => void;
  collapsedMenu: Tab;
  setCollapsedMenu: (collapsed: Tab) => void;
  pauseViewOpen: boolean;
  setPauseViewOpen: (open: boolean) => void;
}

type Tab = "files" | "templates" | "editor";

export default function SlateSider({
  files,
  selectedFile,
  setSelectedFile,
  handleFileChange,
  refreshSpeechData,
  speechId,
  collapsed,
  setCollapsed,
  structuredViewOpen,
  setStructuredViewOpen,
  collapsedMenu,
  setCollapsedMenu,
  pauseViewOpen,
  setPauseViewOpen,
}: SlateSiderProps) {
  const { theme } = useTheme();

  const tabs = [
    {
      id: "files" as Tab,
      icon: <FolderOutlined />,
      label: "Files",
    },
    {
      id: "editor" as Tab,
      icon: <EditOutlined />,
      label: "Editor",
    },
    {
      id: "templates" as Tab,
      icon: <SnippetsOutlined />,
      label: "Templates",
    },
  ];

  function handleTabClick(tab: Tab) {
    setCollapsedMenu(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("sideMenu", tab);
    window.history.pushState({}, "", url);
  }

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
                    handleTabClick(tab.id);
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
            {collapsedMenu === "files" && (
              <SlateFiles
                files={files}
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                handleFileChange={handleFileChange}
                refreshSpeechData={refreshSpeechData}
                speechId={speechId}
                setCollapsed={setCollapsed}
              />
            )}
            {collapsedMenu === "editor" && (
              <SlateSiderMenu
                structuredViewOpen={structuredViewOpen}
                setStructuredViewOpen={setStructuredViewOpen}
                pauseViewOpen={pauseViewOpen}
                setPauseViewOpen={setPauseViewOpen}
              />
            )}
            {collapsedMenu === "templates" && <SlateTemplates />}
          </div>
        </>
      )}
    </div>
  );
}
