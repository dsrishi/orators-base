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
} from "antd";
import {
  AudioOutlined,
  EditOutlined,
  HomeOutlined,
  LineChartOutlined,
  UploadOutlined,
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

interface TiptapEditorProps {
  speechId: string;
  speechData: Speech;
  version: SpeechVersion;
}

export default function TiptapEditor({
  speechId,
  speechData: initialSpeechData,
  version: initialVersion,
}: TiptapEditorProps) {
  const { theme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [speechData, setSpeechData] = useState<Speech>(initialSpeechData);
  const [saving, setSaving] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);

  // Keep basic speech recognition for browser compatibility check
  const { browserSupportsSpeechRecognition, isMicrophoneAvailable } =
    useSpeechRecognition();

  const saveContent = async (content: string) => {
    if (!initialVersion?.id) return;

    setSaving(true);
    const { error } = await speechService.updateVersionContent(
      speechId,
      initialVersion.id,
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

  const debouncedSave = useDebounce(saveContent, 2000);

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
    content: initialVersion?.content,
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

  const handleSpeechUpdate = async () => {
    messageApi.success({
      content: "Changes saved",
      duration: 1,
    });
    const { data, error } = await speechService.getSpeechWithVersion(speechId);
    if (!error && data.speech) {
      setSpeechData(data.speech);
    }
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
            {saving && (
              <span
                style={{
                  color: theme === "dark" ? "#999" : "#666",
                  fontSize: "14px",
                }}
              >
                Saving...
              </span>
            )}
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
      <div className="mt-40 mb-16">
        <div
          style={{ backgroundColor: theme === "dark" ? "#2d2d2d" : "#f5f5f5" }}
          className="min-h-[900px] p-16 max-w-5xl mx-auto rounded"
        >
          <EditorContent editor={editor} />
        </div>
      </div>
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
    </>
  );
}
