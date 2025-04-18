"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
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
  DeleteOutlined,
} from "@ant-design/icons";
import { useState, useEffect, useRef } from "react";
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
import ConfirmationModal from "./ConfirmationModal";

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

  // Sort versions by updated_at before setting the initial state
  const sortVersionsByRecent = (versions: SpeechVersion[]) => {
    return [...versions].sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  };

  // Select the most recently updated version by default
  const getMostRecentVersion = (versions: SpeechVersion[]) => {
    const sortedVersions = sortVersionsByRecent(versions);
    return sortedVersions.length > 0 ? sortedVersions[0] : null;
  };

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [speechData, setSpeechData] = useState<Speech>(initialSpeechData);
  const [versions, setVersions] = useState<SpeechVersion[]>(initialVersions);

  // Set the initially selected version to the most recently updated one
  const [selectedVersion, setSelectedVersion] = useState<SpeechVersion>(
    getMostRecentVersion(initialVersions) || initialVersions[0]
  );

  const [collapsed, setCollapsed] = useState(initialVersions.length <= 1);
  const [saving, setSaving] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  const [newVersionModalOpen, setNewVersionModalOpen] = useState(false);

  // Keep basic speech recognition for browser compatibility check
  const { browserSupportsSpeechRecognition, isMicrophoneAvailable } =
    useSpeechRecognition();

  // Add a ref to store unsaved content for each version
  const unsavedContentCache = useRef<Record<string, string>>({});

  const [editVersionId, setEditVersionId] = useState<string | null>(null);
  const [editVersionName, setEditVersionName] = useState("");
  const [confirmDeleteModalVisible, setConfirmDeleteModalVisible] =
    useState(false);
  const [versionToDelete, setVersionToDelete] = useState<SpeechVersion | null>(
    null
  );

  const saveContent = async (content: string) => {
    if (!selectedVersion?.id) return;

    // Store content in cache before saving
    unsavedContentCache.current[selectedVersion.id] = content;

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
    Underline,
    Placeholder.configure({
      placeholder: "Start writing your speech...",
    }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    Highlight.configure({ multicolor: true }),
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

      // Store the latest content in our cache
      unsavedContentCache.current[selectedVersion.id] = content;

      // Debounce the save to backend
      debouncedSave(content);
    },
  });

  // Modify version switching to handle unsaved content
  const handleVersionChange = (versionId: string) => {
    const version = versions.find((v) => v.id === versionId);
    if (!version || version.id === selectedVersion.id) return;

    // Cache the current content before switching
    if (editor) {
      const currentContent = editor.getHTML();
      unsavedContentCache.current[selectedVersion.id] = currentContent;
    }

    // Switch to the new version
    setSelectedVersion(version);
  };

  // Update the useEffect for switching versions to respect cached content
  useEffect(() => {
    if (editor && selectedVersion) {
      // Check if we have unsaved content for this version
      const cachedContent = unsavedContentCache.current[selectedVersion.id];

      // Use cached content if available, otherwise use the saved content
      const contentToUse = cachedContent || selectedVersion.content || "";

      // Update the editor content
      editor.commands.setContent(contentToUse);
    }
  }, [editor, selectedVersion]);

  // Hide the versions if there is only one version
  useEffect(() => {
    setCollapsed(versions.length <= 1);
  }, []);

  // Update the refreshSpeechData to handle syncing with our cache
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
          // Only update the server content, not our editor's content
          // This prevents refreshing from throwing away unsaved changes
          const updatedVersion = {
            ...currentVersion,
            // Keep local changes if they exist
            content:
              unsavedContentCache.current[currentVersion.id] ||
              currentVersion.content,
          };
          setSelectedVersion(updatedVersion);
        }
      }
    }
  };

  const handleSpeechUpdate = async () => {
    messageApi.success({
      content: "Changes saved",
      duration: 1,
    });
    refreshSpeechData();
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

      // Make sure the versions panel is open to show the new version
      setCollapsed(false);

      // If editor exists, focus it to provide a seamless experience
      if (editor) {
        setTimeout(() => editor.commands.focus(), 100);
      }
    }

    setNewVersionModalOpen(false);
  };

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

  const handleEditVersionClick = (
    e: React.MouseEvent,
    version: SpeechVersion
  ) => {
    e.stopPropagation(); // Prevent menu item click
    setEditVersionId(version.id);
    setEditVersionName(version.version_name);
  };

  const handleVersionNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditVersionName(e.target.value);
  };

  const handleVersionNameSave = async () => {
    if (!editVersionId || !editVersionName.trim()) return;

    try {
      const { error } = await speechService.updateVersionInfo(editVersionId, {
        versionName: editVersionName.trim(),
      });

      if (error) {
        messageApi.error({
          content: "Failed to update version name",
          duration: 3,
        });
        return;
      }

      messageApi.success({
        content: "Version name updated",
        duration: 2,
      });

      // Refresh to get updated data
      await refreshSpeechData();
    } catch (error) {
      messageApi.error({
        content: error instanceof Error ? error.message : "An error occurred",
        duration: 3,
      });
    } finally {
      setEditVersionId(null);
      setEditVersionName("");
    }
  };

  const handleDeleteVersionClick = (
    e: React.MouseEvent,
    version: SpeechVersion
  ) => {
    e.stopPropagation(); // Prevent menu item click
    setVersionToDelete(version);
    setConfirmDeleteModalVisible(true);
  };

  const handleDeleteVersion = async () => {
    if (!versionToDelete) return;

    try {
      const { error } = await speechService.deleteVersion(
        speechId,
        versionToDelete.id
      );

      if (error) {
        messageApi.error({
          content: error.message || "Failed to delete version",
          duration: 3,
        });
        return;
      }

      messageApi.success({
        content: "Version deleted",
        duration: 2,
      });

      // Refresh versions and select the most recent one
      await refreshSpeechData();

      // If we deleted the currently selected version, select the most recent one
      if (versionToDelete.id === selectedVersion.id) {
        const updatedVersions = versions.filter(
          (v) => v.id !== versionToDelete.id
        );
        const mostRecentVersion = getMostRecentVersion(updatedVersions);
        if (mostRecentVersion) {
          setSelectedVersion(mostRecentVersion);
        }
      }
    } catch (error) {
      messageApi.error({
        content: error instanceof Error ? error.message : "An error occurred",
        duration: 3,
      });
    } finally {
      // Close the modal
      setConfirmDeleteModalVisible(false);
      setVersionToDelete(null);
    }
  };

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

      <Layout
        className="mb-16"
        style={{ background: "transparent", marginTop: "120px" }}
        hasSider
      >
        <Sider
          width={250}
          collapsible
          collapsed={collapsed}
          collapsedWidth="0"
          onCollapse={(value) => setCollapsed(value)}
          trigger={null}
          breakpoint="lg"
          style={{
            backgroundColor: theme === "dark" ? "#212121" : "#fafafa",
            overflow: "auto",
            height: "calc(100vh - 120px)",
            position: "fixed",
            left: 0,
          }}
        >
          <div className="flex justify-between items-center px-4 pt-6 pb-3">
            <div className="text-lg font-semibold">Versions</div>
            <Tooltip title="Create New Version">
              <Button
                icon={<PlusOutlined />}
                onClick={() => setNewVersionModalOpen(true)}
              />
            </Tooltip>
          </div>

          <Menu
            mode="inline"
            selectedKeys={[selectedVersion?.id || ""]}
            style={{
              backgroundColor: theme === "dark" ? "#212121" : "#fafafa",
              borderRight: 0,
            }}
            theme={theme === "dark" ? "dark" : "light"}
            onClick={({ key }) => handleVersionChange(key)}
            items={sortVersionsByRecent(versions).map((version) => ({
              key: version.id,
              label: (
                <div className="flex items-center justify-between group relative">
                  {editVersionId === version.id ? (
                    <input
                      autoFocus
                      value={editVersionName}
                      onChange={handleVersionNameChange}
                      onBlur={handleVersionNameSave}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleVersionNameSave();
                        if (e.key === "Escape") {
                          setEditVersionId(null);
                          setEditVersionName("");
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-transparent border-b border-gray-400 outline-none px-1 py-0 mr-2"
                      style={{
                        color: theme === "dark" ? "#ffffff" : "#000000",
                      }}
                    />
                  ) : (
                    <>
                      <div className="w-32 truncate">
                        {version.version_name}
                      </div>
                      <div className="hidden group-hover:flex items-center space-x-1 absolute right-0 bg-inherit">
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={(e) => handleEditVersionClick(e, version)}
                        />
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={(e) => handleDeleteVersionClick(e, version)}
                          disabled={versions.length <= 1} // Prevent deleting the only version
                        />
                      </div>
                    </>
                  )}
                </div>
              ),
            }))}
          />
        </Sider>

        <Content
          style={{
            padding: "32px 24px",
            marginLeft: collapsed ? 0 : 250,
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

      <ConfirmationModal
        title="Delete Version"
        message={`Are you sure you want to delete "${versionToDelete?.version_name}"?`}
        subMessage="This action cannot be undone."
        open={confirmDeleteModalVisible}
        onCancel={() => setConfirmDeleteModalVisible(false)}
        onConfirm={handleDeleteVersion}
        confirmText="Delete"
        danger={true}
      />
    </>
  );
}
