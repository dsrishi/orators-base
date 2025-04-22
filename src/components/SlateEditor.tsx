"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { FloatButton, message, Layout, Spin } from "antd";
import { AudioOutlined, UploadOutlined } from "@ant-design/icons";
import { useState, useEffect, useRef, useMemo } from "react";
import { Speech, SpeechVersion } from "@/types/speech";
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
  versions: SpeechVersion[];
}

type Tab = "versions" | "chat" | "templates" | "editor";

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
  const [collapsedMenu, setCollapsedMenu] = useState<Tab>("versions");
  const [saving, setSaving] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  const [structuredViewOpen, setStructuredViewOpen] = useState(false);
  const [value, setValue] = useState<Descendant[]>(
    JSON.parse(selectedVersion?.content)
  );
  const [canSave, setCanSave] = useState(false);

  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

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

  // Modify version switching to handle unsaved content
  const handleVersionChange = (versionId: string) => {
    const version = versions.find((v) => v.id === versionId);
    if (!version || version.id === selectedVersion.id) return;

    // Cache the current content before switching
    unsavedContentCache.current[selectedVersion.id] = selectedVersion.content;

    // Switch to the new version
    setSelectedVersion(version);
    setValue(JSON.parse(version.content));
  };

  // Hide the versions if there is only one version
  useEffect(() => {
    setCollapsed(versions.length <= 1);
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
        key={selectedVersion?.id}
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
              versions={versions}
              selectedVersion={selectedVersion}
              setSelectedVersion={setSelectedVersion}
              handleVersionChange={handleVersionChange}
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
          subMessage="This will delete the speech and all its versions. This action cannot be undone."
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
