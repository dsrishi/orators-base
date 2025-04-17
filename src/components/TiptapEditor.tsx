"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { useTheme } from "@/contexts/ThemeContext";
import TipTapMenuBar from "./TipTapMenuBar";
import {
  Breadcrumb,
  Button,
  Divider,
  FloatButton,
  message,
  Tooltip,
  Menu,
  Layout,
  Spin,
} from "antd";
import {
  AudioOutlined,
  EditOutlined,
  HomeOutlined,
  LineChartOutlined,
  UploadOutlined,
  PlusOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import SpeechAnalysisDrawer from "./SpeechAnalysisDrawer";
import { Speech, SpeechVersion } from "@/types/speech";
import SpeechInfoModal from "./SpeechInfoModal";
import { speechService } from "@/services/speechService";
import { useDebounce } from "@/hooks/useDebounce";
import ComingSoonModal from "./ComingSoonModal";
import SpeechRecordingModal from "./SpeechRecordingModal";
import { useSpeechRecognition } from "react-speech-recognition";
import { useAuth } from "@/contexts/AuthContext";
import NewVersionModal from "./NewVersionModal";

const { Sider, Content } = Layout;

interface TiptapEditorProps {
  speechId: string;
  speechData: Speech;
  versions: SpeechVersion[];
}

export default function TiptapEditor({
  speechId,
  speechData: initialSpeechData,
  versions: initialVersions,
}: TiptapEditorProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [speechData, setSpeechData] = useState<Speech>(initialSpeechData);
  const [versions, setVersions] = useState<SpeechVersion[]>(initialVersions);
  const [selectedVersion, setSelectedVersion] = useState<SpeechVersion>(
    initialVersions[0]
  );
  const [collapsed, setCollapsed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  const [newVersionModalOpen, setNewVersionModalOpen] = useState(false);

  // Keep basic speech recognition for browser compatibility check
  const { browserSupportsSpeechRecognition, isMicrophoneAvailable } =
    useSpeechRecognition();

  const saveContent = async (content: string) => {
    if (!selectedVersion?.id) return;

    setSaving(true);
    const { error } = await speechService.updateVersionContent(
      speechId,
      selectedVersion.id,
      { content }
    );

    if (error) {
      messageApi.error({
        content: "Failed to save changes",
        duration: 3,
      });
    }
    setSaving(false);
  };

  const debouncedSave = useDebounce(saveContent, 1000);

  const editorExtensions = [
    StarterKit,
    TextStyle,
    Color,
    FontFamily,
    Placeholder.configure({
      placeholder: "Start writing your speech...",
    }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
  ];

  const editor = useEditor({
    extensions: editorExtensions,
    content: selectedVersion?.content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      debouncedSave(content);
    },
  });

  // Update editor content when selected version changes
  useEffect(() => {
    if (editor && selectedVersion) {
      editor.commands.setContent(selectedVersion.content || "");
    }
  }, [editor, selectedVersion]);

  const handleSpeechUpdate = async () => {
    messageApi.success({
      content: "Changes saved",
      duration: 1,
    });
    refreshSpeechData();
  };

  const refreshSpeechData = async () => {
    const { data, error } = await speechService.getSpeechWithAllVersions(
      speechId
    );
    if (!error && data.speech) {
      setSpeechData(data.speech);
      if (data.speech.versions) {
        setVersions(data.speech.versions);

        // Update selected version to match the currently selected one
        const currentVersion = data.speech.versions.find(
          (v) => v.id === selectedVersion.id
        );
        if (currentVersion) {
          setSelectedVersion(currentVersion);
        }
      }
    }
  };

  const handleCreateNewVersion = async (versionName: string) => {
    if (!user?.id) return;

    const { versionId, error } = await speechService.createNewVersion(
      speechId,
      {
        versionName: versionName || `Version ${versions.length + 1}`,
        baseVersionId: selectedVersion.id,
        userId: user.id,
      }
    );

    if (error) {
      messageApi.error({
        content: "Failed to create new version",
        duration: 3,
      });
      throw error; // This will be caught by the modal
    }

    messageApi.success({
      content: "New version created",
      duration: 2,
    });

    await refreshSpeechData();

    // Find and select the newly created version
    const newVersions = [...versions];
    const newVersion = newVersions.find((v) => v.id === versionId);
    if (newVersion) {
      setSelectedVersion(newVersion);
    }

    setNewVersionModalOpen(false);
  };

  // Add a function to sort versions by updated_at date
  const sortedVersions = [...versions].sort((a, b) => {
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  // Function to handle adding content from the speech modal
  const handleAddSpeechContent = (content: string) => {
    if (editor && content.trim()) {
      // Add the content at the current cursor position
      const pos = editor.view.state.selection.anchor;
      editor.chain().focus().insertContentAt(pos, content).run();

      // Save changes
      const editorContent = editor.getHTML();
      debouncedSave(editorContent);

      messageApi.success({
        content: "Speech content added",
        duration: 2,
      });
    }
  };

  // Add browser support check for speech recognition
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      messageApi.warning({
        content:
          "Speech recognition is not supported in this browser. Please use Chrome for best experience.",
        duration: 5,
      });
    } else if (!isMicrophoneAvailable) {
      messageApi.warning({
        content:
          "You have to enable the mic to use this feature. Please check your browser settings.",
        duration: 5,
      });
    }
  }, [browserSupportsSpeechRecognition, messageApi, isMicrophoneAvailable]);

  return (
    <>
      {contextHolder}
      <div
        className="fixed w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 z-10 top-16"
        style={{
          backgroundColor: theme === "dark" ? "#1e1e1e" : "#ffffff",
          borderBottom:
            theme === "dark" ? "solid 1px #2d2d2d" : "solid 1px #e5e5e5",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center gap-1">
              <div>
                <Breadcrumb
                  items={[
                    {
                      href: "/dashboard",
                      title: <HomeOutlined />,
                    },
                    {
                      title: speechData.title,
                    },
                  ]}
                />
              </div>
              <div className="ml-1">
                <Tooltip title="Edit">
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => setInfoModalOpen(true)}
                  />
                </Tooltip>
              </div>
              <div className="ml-1">
                <Tooltip title="Versions">
                  <Button
                    icon={<HistoryOutlined />}
                    onClick={() => setCollapsed(!collapsed)}
                  />
                </Tooltip>
              </div>
            </div>
            <Divider
              type="vertical"
              style={{
                backgroundColor: theme === "dark" ? "#999" : "#aaa",
                height: "24px",
                margin: "auto 16px",
              }}
            />
            <TipTapMenuBar editor={editor} />
          </div>
          <div className="flex items-center gap-2">
            {saving && <Spin size="small" />}
            <Button
              type="primary"
              icon={<LineChartOutlined />}
              onClick={() => setDrawerOpen(true)}
              style={{
                border: "none",
                boxShadow: "none",
              }}
              className="primary-gradient"
            >
              Analyse
            </Button>
          </div>
        </div>
      </div>

      <Layout className="mt-32 mb-16" style={{ background: "transparent" }}>
        <Sider
          width={250}
          collapsible
          collapsed={collapsed}
          collapsedWidth="0"
          onCollapse={(value) => setCollapsed(value)}
          trigger={null}
          breakpoint="lg"
          style={{
            backgroundColor: theme === "dark" ? "#1e1e1e" : "#ffffff",
            overflow: "auto",
            height: "calc(100vh - 180px)",
            position: "sticky",
            top: "136px",
            left: 0,
          }}
        >
          <div className="flex justify-between items-center p-3">
            <div className="text-lg font-semibold">Versions</div>
            <Button
              type="text"
              icon={<PlusOutlined />}
              onClick={() => setNewVersionModalOpen(true)}
            />
          </div>

          <Menu
            mode="inline"
            selectedKeys={[selectedVersion?.id || ""]}
            style={{
              backgroundColor: theme === "dark" ? "#1e1e1e" : "#ffffff",
              borderRight: 0,
            }}
            theme={theme === "dark" ? "dark" : "light"}
            onClick={({ key }) => {
              const version = versions.find((v) => v.id === key);
              if (version) setSelectedVersion(version);
            }}
            items={[
              ...sortedVersions.map((version) => ({
                key: version.id,
                label: <div>{version.version_name}</div>,
              })),
            ]}
          />
        </Sider>

        <Content
          style={{
            padding: "0 24px",
            marginLeft: collapsed ? 0 : 10,
            transition: "margin-left 0.2s",
          }}
        >
          <div
            style={{
              backgroundColor: theme === "dark" ? "#2d2d2d" : "#f5f5f5",
            }}
            className="min-h-[900px] p-16 rounded max-w-[1000px] mx-auto"
          >
            <EditorContent editor={editor} />
          </div>
        </Content>
      </Layout>

      <FloatButton.Group shape="circle" style={{ insetInlineEnd: 24 }}>
        <FloatButton
          icon={<AudioOutlined />}
          tooltip={<div>Record Speech</div>}
          onClick={() => setIsRecordingModalOpen(true)}
        />
        <FloatButton
          onClick={() => setIsComingSoonModalOpen(true)}
          icon={<UploadOutlined />}
          tooltip={<div>Upload</div>}
        />
      </FloatButton.Group>

      <NewVersionModal
        open={newVersionModalOpen}
        onClose={() => setNewVersionModalOpen(false)}
        onCreateVersion={handleCreateNewVersion}
      />

      <SpeechRecordingModal
        open={isRecordingModalOpen}
        onClose={() => setIsRecordingModalOpen(false)}
        onAddContent={handleAddSpeechContent}
      />

      <ComingSoonModal
        open={isComingSoonModalOpen}
        onClose={() => setIsComingSoonModalOpen(false)}
        featureTitle="Upload a speech"
      />

      <SpeechAnalysisDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editor={editor}
        speechData={speechData}
        key={drawerOpen ? "open-drawer" : "closed-drawer"}
      />

      <SpeechInfoModal
        open={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        speechId={speechId}
        speechData={speechData}
        onUpdate={handleSpeechUpdate}
      />
    </>
  );
}
