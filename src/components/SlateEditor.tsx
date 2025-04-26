"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { FloatButton, message, Layout, Spin } from "antd";
import { AudioOutlined, UploadOutlined } from "@ant-design/icons";
import { useState, useEffect, useRef, useMemo } from "react";
import { Speech, SpeechFile } from "@/types/speech";
import SpeechInfoModal from "./SpeechInfoModal";
import { speechService } from "@/services/speechService";
import { useDebounce } from "@/hooks/useDebounce";
import ComingSoonModal from "./ComingSoonModal";
// @ts-expect-error - need to fix this
import { useSpeechRecognition } from "react-speech-recognition";
import { HardConfirmationModal } from "./ConfirmationModal";
import SlateTopBar from "./slate/SlateTopBar";
import SlateSider from "./slate/SlateSider";
import SlateTextEditor from "./slate/SlateTextEditor";
import SlateAnalyseDrawer from "./slate/SlateAnalyseDrawer";
import { Slate, withReact } from "slate-react";
import { withHistory } from "slate-history";
import { createEditor, Descendant } from "slate";
const { Sider, Content } = Layout;

interface SlateEditorProps {
  speechId: string;
  speechData: Speech;
  files: SpeechFile[];
}

type Tab = "files" | "chat" | "templates" | "editor";

export default function SlateEditor({
  speechId,
  speechData: initialSpeechData,
  files: initialFiles,
}: SlateEditorProps) {
  const { theme } = useTheme();

  // Sort files by updated_at before setting the initial state
  const sortFilesByRecent = (files: SpeechFile[]) => {
    return [...files].sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  };

  // Select the most recently updated file by default
  const getMostRecentFile = (files: SpeechFile[]) => {
    const sortedFiles = sortFilesByRecent(files);
    return sortedFiles.length > 0 ? sortedFiles[0] : null;
  };

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [speechData, setSpeechData] = useState<Speech>(initialSpeechData);
  const [files, setFiles] = useState<SpeechFile[]>(initialFiles);

  // Set the initially selected file to the most recently updated one
  const [selectedFile, setSelectedFile] = useState<SpeechFile>(
    getMostRecentFile(initialFiles) || initialFiles[0]
  );

  const [collapsed, setCollapsed] = useState(initialFiles.length <= 1);
  const [collapsedMenu, setCollapsedMenu] = useState<Tab>("files");
  const [saving, setSaving] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  const [structuredViewOpen, setStructuredViewOpen] = useState(false);
  const [value, setValue] = useState<Descendant[]>(
    JSON.parse(selectedFile?.content)
  );
  const [canSave, setCanSave] = useState(false);

  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  // Keep basic speech recognition for browser compatibility check
  const { browserSupportsSpeechRecognition, isMicrophoneAvailable } =
    useSpeechRecognition();

  // Add a ref to store unsaved content for each file
  const unsavedContentCache = useRef<Record<string, string>>({});

  const [deleteSpeechModalVisible, setDeleteSpeechModalVisible] =
    useState(false);

  const saveContent = async (content: string) => {
    if (!selectedFile?.id) return;

    // Store content in cache before saving
    unsavedContentCache.current[selectedFile.id] = content;

    setSaving(true);
    const { error } = await speechService.updateFileContent(
      speechId,
      selectedFile.id,
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

  // Modify file switching to handle unsaved content
  const handleFileChange = (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (!file || file.id === selectedFile.id) return;

    // Cache the current content before switching
    unsavedContentCache.current[selectedFile.id] = selectedFile.content;

    // Switch to the new file
    setSelectedFile(file);
    setValue(JSON.parse(file.content));
  };

  // Hide the files if there is only one file
  useEffect(() => {
    setCollapsed(files.length <= 1);
  }, []);

  useEffect(() => {
    if (canSave) {
      debouncedSave(JSON.stringify(value));
    } else {
      setCanSave(true);
    }
  }, [value]);

  // Update the refreshSpeechData to handle syncing with our cache
  const refreshSpeechData = async () => {
    const { data, error } = await speechService.getSpeechWithAllFiles(speechId);
    if (!error && data.speech) {
      setSpeechData(data.speech);
      if (data.speech.files) {
        setFiles(data.speech.files);

        // Update selected file to match the currently selected one
        const currentFile = data.speech.files.find(
          (f) => f.id === selectedFile.id
        );
        if (currentFile) {
          // Only update the server content, not our editor's content
          // This prevents refreshing from throwing away unsaved changes
          const updatedFile = {
            ...currentFile,
            // Keep local changes if they exist
            content:
              unsavedContentCache.current[currentFile.id] ||
              currentFile.content,
          };
          setSelectedFile(updatedFile);
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
      <Slate
        key={selectedFile?.id}
        editor={editor}
        initialValue={value}
        onChange={(newValue) => setValue(newValue)}
      >
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
              files={files}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              handleFileChange={handleFileChange}
              refreshSpeechData={refreshSpeechData}
              speechId={speechId}
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              collapsedMenu={collapsedMenu}
              setCollapsedMenu={setCollapsedMenu}
              structuredViewOpen={structuredViewOpen}
              setStructuredViewOpen={setStructuredViewOpen}
            />
          </Sider>

          <Content
            style={{
              transition: "margin-left 0.2s",
            }}
            className={`${collapsed ? "ml-0" : "lg:ml-[280px] ml-0"}`}
          >
            <div className="mt-16 px-3 pt-2 pb-16">
              <SlateTextEditor
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                isRecordingModalOpen={isRecordingModalOpen}
                setIsRecordingModalOpen={setIsRecordingModalOpen}
                structuredViewOpen={structuredViewOpen}
                setCollapsedMenu={setCollapsedMenu}
              />
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

        <ComingSoonModal
          open={isComingSoonModalOpen}
          onClose={() => setIsComingSoonModalOpen(false)}
          featureTitle="Upload a speech"
        />

        <SlateAnalyseDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          speechData={speechData}
          content={value}
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
          subMessage="This will delete the speech and all its files. This action cannot be undone."
          open={deleteSpeechModalVisible}
          onCancel={() => setDeleteSpeechModalVisible(false)}
          onConfirm={handleDeleteSpeech}
          confirmText="Delete"
          danger={true}
        />
      </Slate>
    </>
  );
}
