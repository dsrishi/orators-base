import React, { useEffect, useRef } from "react";
import { Modal, Button, Typography, Space } from "antd";
import {
  AudioMutedOutlined,
  AudioOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useTheme } from "@/contexts/ThemeContext";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const { Paragraph, Text } = Typography;

interface SpeechRecordingModalProps {
  open: boolean;
  onClose: () => void;
  onAddContent: (content: string) => void;
}

const SpeechRecordingModal: React.FC<SpeechRecordingModalProps> = ({
  open,
  onClose,
  onAddContent,
}) => {
  const { theme } = useTheme();
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop =
        transcriptContainerRef.current.scrollHeight;
    }
  }, [transcript]);

  useEffect(() => {
    if (open && !listening && browserSupportsSpeechRecognition) {
      handleRecordingToggle();
    }

    // Clean up when modal closes
    return () => {
      if (listening) {
        SpeechRecognition.stopListening();
      }
    };
  }, [open, browserSupportsSpeechRecognition]);

  const handleRecordingToggle = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.startListening({
        continuous: true,
        interimResults: true,
      });
    }
  };

  const handleAddContent = async () => {
    if (transcript.trim()) {
      onAddContent(transcript);
    }
    await resetTranscript();
    onClose();
  };

  const handleCancel = async () => {
    SpeechRecognition.stopListening();
    await resetTranscript();
    onClose();
  };

  return (
    <Modal
      title="Speech Recording"
      open={open}
      onCancel={() => handleCancel()}
      width={700}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="record"
          type={listening ? "primary" : "default"}
          danger={listening}
          icon={listening ? <AudioMutedOutlined /> : <AudioOutlined />}
          onClick={handleRecordingToggle}
        >
          {listening ? "Stop" : "Start"}
        </Button>,
        <Button
          key="add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddContent}
          disabled={!transcript.trim() || listening}
        >
          Add
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        {!browserSupportsSpeechRecognition && (
          <Paragraph style={{ color: "red" }}>
            Your browser doesn&apos;t support speech recognition. Please use
            Chrome for the best experience.
          </Paragraph>
        )}

        {!isMicrophoneAvailable && browserSupportsSpeechRecognition && (
          <Paragraph style={{ color: "red" }}>
            Please enable microphone access to use this feature.
          </Paragraph>
        )}
        <div className="text-xs text-gray-500 italic">
          <p>
            After you finish speaking, stop the recording to save it to your
            speech.
          </p>
          <p>
            This feature is currently under development. If the text box below
            does not display what you&apos;re speaking, please stop the
            recording and start again.
          </p>
        </div>

        {listening ? (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <Text style={{ color: theme === "dark" ? "#999" : "#666" }}>
              Recording...
            </Text>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-gray-500" />
            <Text style={{ color: theme === "dark" ? "#999" : "#666" }}>
              Recording stopped
            </Text>
          </div>
        )}

        <div
          ref={transcriptContainerRef}
          style={{
            minHeight: "200px",
            maxHeight: "200px",
            overflowY: "auto",
            padding: "16px",
            borderRadius: "4px",
            border: "1px solid",
            borderColor: theme === "dark" ? "#2d2d2d" : "#d9d9d9",
            backgroundColor: theme === "dark" ? "#262626" : "#f9f9f9",
          }}
        >
          {transcript ? (
            <Paragraph style={{ color: theme === "dark" ? "#fff" : "#000" }}>
              {transcript}
            </Paragraph>
          ) : (
            <Paragraph
              style={{
                color: theme === "dark" ? "#999" : "#999",
                fontStyle: "italic",
              }}
            >
              Start speaking to see your words appear here...
            </Paragraph>
          )}
        </div>
      </Space>
    </Modal>
  );
};

export default SpeechRecordingModal;
