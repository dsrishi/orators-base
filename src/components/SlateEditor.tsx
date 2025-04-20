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
  Button,
  FloatButton,
  message,
  Tooltip,
  Layout,
  Popover,
  Spin,
} from "antd";
import { AudioOutlined, UploadOutlined, MoreOutlined } from "@ant-design/icons";
import { useState, useEffect, useRef } from "react";
import SpeechAnalysisDrawer from "./SpeechAnalysisDrawer";
import { Speech, SpeechVersion } from "@/types/speech";
import SpeechInfoModal from "./SpeechInfoModal";
import { speechService } from "@/services/speechService";
import { useDebounce } from "@/hooks/useDebounce";
import ComingSoonModal from "./ComingSoonModal";
import SpeechRecordingModal from "./SpeechRecordingModal";
// @ts-expect-error - need to fix this
import { useSpeechRecognition } from "react-speech-recognition";
import { HardConfirmationModal } from "./ConfirmationModal";
import { FontSize } from "@/extensions/FontSize";
import SlateTopBar from "./slate/SlateTopBar";
import SlateSider from "./slate/SlateSider";

const { Sider, Content } = Layout;

interface SlateEditorProps {
  speechId: string;
  speechData: Speech;
  versions: SpeechVersion[];
}

export default function SlateEditor({
  speechId,
  speechData: initialSpeechData,
  versions: initialVersions,
}: SlateEditorProps) {
  const { theme } = useTheme();

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

  // Keep basic speech recognition for browser compatibility check
  const { browserSupportsSpeechRecognition, isMicrophoneAvailable } =
    useSpeechRecognition();

  // Add a ref to store unsaved content for each version
  const unsavedContentCache = useRef<Record<string, string>>({});

  const [deleteSpeechModalVisible, setDeleteSpeechModalVisible] =
    useState(false);

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
    FontSize,
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

  const handleDeleteSpeech = async () => {
    try {
      const { error } = await speechService.deleteSpeech(speechId);

      if (error) {
        messageApi.error({
          content:
            typeof error === "object" && "message" in error
              ? String(error.message)
              : "Failed to delete speech",
          duration: 3,
        });
        return;
      }

      messageApi.success({
        content: "Speech deleted successfully",
        duration: 2,
      });

      // Redirect to dashboard after deletion
      window.location.href = "/dashboard";
    } catch (error) {
      messageApi.error({
        content: error instanceof Error ? error.message : "An error occurred",
        duration: 3,
      });
    } finally {
      setDeleteSpeechModalVisible(false);
    }
  };

  return (
    <>
      {contextHolder}
      <SlateTopBar
        setCollapsed={setCollapsed}
        collapsed={collapsed}
        setSpeechInfoModalOpen={setInfoModalOpen}
        setSpeechAnalysisDrawerOpen={setDrawerOpen}
        setDeleteSpeechModalVisible={setDeleteSpeechModalVisible}
        speechData={speechData}
      />

      <Layout
        className="absolute w-full overflow-auto bottom-0"
        style={{
          backgroundColor: theme === "dark" ? "#2d2d2d" : "#f5f5f5",
          top: "56px",
        }}
        hasSider
      >
        <Sider
          width={280}
          collapsible
          collapsed={collapsed}
          collapsedWidth="0"
          onCollapse={(value) => setCollapsed(value)}
          trigger={null}
          breakpoint="lg"
          style={{
            backgroundColor: theme === "dark" ? "#1e1e1e" : "#ffffff",
            overflow: "auto",
            height: "calc(100vh - 56px)",
            position: "fixed",
            left: 0,
            zIndex: 15,
          }}
        >
          <SlateSider
            versions={versions}
            selectedVersion={selectedVersion}
            setSelectedVersion={setSelectedVersion}
            handleVersionChange={handleVersionChange}
            refreshSpeechData={refreshSpeechData}
            speechId={speechId}
            editor={editor}
            setCollapsed={setCollapsed}
          />
        </Sider>

        <Content
          style={{
            transition: "margin-left 0.2s",
          }}
          className={`${collapsed ? "ml-0" : "lg:ml-[280px] ml-0"}`}
        >
          <div
            className="fixed mx-auto px-3 py-1 z-10 top-[64px]"
            style={{
              width: collapsed ? "100%" : "calc(100% - 280px)",
              transition: "width 0.2s",
            }}
          >
            <div className="flex items-center justify-center">
              <div
                className="p-3 shadow-md rounded-md"
                style={{
                  backgroundColor: theme === "dark" ? "#1e1e1e" : "#ffffff",
                }}
              >
                <div className="lg:hidden">
                  <Popover
                    content={<TipTapMenuBar editor={editor} />}
                    trigger="click"
                    placement="bottom"
                  >
                    <Tooltip title="Highlight Color">
                      <Button icon={<MoreOutlined />} />
                    </Tooltip>
                  </Popover>
                </div>
                <div className="hidden lg:block">
                  <TipTapMenuBar editor={editor} />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-16 px-3 pt-4 pb-16">
            <div
              style={{
                backgroundColor: theme === "dark" ? "#1e1e1e" : "#ffffff",
              }}
              className="min-h-[900px] lg:p-16 md:p-12 sm:p-8 p-4 rounded max-w-[1000px] mx-auto"
            >
              <EditorContent editor={editor} />
            </div>
          </div>
        </Content>
        {saving && (
          <div className="fixed bottom-0 left-0 right-0 p-4 z-20">
            <div className="flex items-center justify-center">
              <Spin size="small" />
            </div>
          </div>
        )}
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

      <HardConfirmationModal
        title="Delete Speech"
        message={`Are you sure you want to delete "${speechData.title}"?`}
        subMessage="This will delete the speech and all its versions. This action cannot be undone."
        open={deleteSpeechModalVisible}
        onCancel={() => setDeleteSpeechModalVisible(false)}
        onConfirm={handleDeleteSpeech}
        confirmText="Delete"
        danger={true}
      />
    </>
  );
}
