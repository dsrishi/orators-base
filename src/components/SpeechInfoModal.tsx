import { Modal, Form, Input, Select, InputNumber } from "antd";
import { useTheme } from "@/contexts/ThemeContext";
import TextArea from "antd/es/input/TextArea";
import { Speech } from "@/types/speech";
import { speechService } from "@/services/speechService";
import { useEffect } from "react";

interface SpeechInfoModalProps {
  open: boolean;
  onClose: () => void;
  speechId?: string;
  speechData?: Speech;
  onUpdate?: () => void;
}

const { Option } = Select;

const MAIN_TYPES = [
  { value: "business", label: "Business" },
  { value: "technical", label: "Technical" },
  { value: "motivational", label: "Motivational" },
  { value: "educational", label: "Educational" },
  { value: "other", label: "Other" },
];

const OCCASIONS = [
  { value: "conference", label: "Conference" },
  { value: "meeting", label: "Meeting" },
  { value: "presentation", label: "Presentation" },
  { value: "ceremony", label: "Ceremony" },
  { value: "workshop", label: "Workshop" },
];

const MEDIUMS = [
  { value: "in_person", label: "In Person" },
  { value: "virtual", label: "Virtual" },
  { value: "hybrid", label: "Hybrid" },
  { value: "recorded", label: "Recorded" },
];

const TONES = [
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Casual" },
  { value: "professional", label: "Professional" },
  { value: "conversational", label: "Conversational" },
  { value: "humorous", label: "Humorous" },
];

const LANGUAGES = [{ value: "en", label: "English" }];

export default function SpeechInfoModal({
  open,
  onClose,
  speechId,
  speechData,
  onUpdate,
}: SpeechInfoModalProps) {
  const { theme } = useTheme();
  const [form] = Form.useForm();

  useEffect(() => {
    if (speechData) {
      form.setFieldsValue({
        title: speechData.title,
        description: speechData.description,
        main_type: speechData.main_type,
        duration: speechData.duration,
        target_audience: speechData.target_audience,
        language: speechData.language,
        objective: speechData.objective,
        purpose: speechData.purpose,
        tone: speechData.tone,
        medium: speechData.medium,
        occasion: speechData.occasion,
      });
    }
  }, [speechData, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (speechId) {
        const { error } = await speechService.updateSpeechInfo(
          speechId,
          values
        );

        if (error) {
          throw new Error(error.message);
        }

        if (onUpdate) {
          onUpdate();
        }
      }

      onClose();
    } catch (error) {
      console.error("Error updating speech:", error);
    }
  };

  const selectStyle = {
    background: theme === "dark" ? "#2d2d2d" : "#ffffff",
  };

  const inputStyle = {
    background: theme === "dark" ? "#2d2d2d" : "#ffffff",
    borderColor: theme === "dark" ? "#3d3d3d" : "#d9d9d9",
    color: theme === "dark" ? "#ffffff" : "#000000",
  };

  return (
    <Modal
      title="Speech Information"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Save"
      cancelText="Cancel"
      width={720}
      styles={{
        header: {
          background: theme === "dark" ? "#1e1e1e" : "#ffffff",
          color: theme === "dark" ? "#ffffff" : "#000000",
        },
        content: {
          background: theme === "dark" ? "#1e1e1e" : "#ffffff",
        },
        body: {
          background: theme === "dark" ? "#1e1e1e" : "#ffffff",
        },
        footer: {
          background: theme === "dark" ? "#1e1e1e" : "#ffffff",
        },
      }}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          label={
            <span style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>
              Title
            </span>
          }
          name="title"
          rules={[{ required: true, message: "Please enter speech title" }]}
        >
          <Input style={inputStyle} />
        </Form.Item>

        <Form.Item
          label={
            <span style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>
              Description
            </span>
          }
          name="description"
        >
          <TextArea rows={4} style={inputStyle} />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <Form.Item
            label={
              <span style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>
                Duration (minutes)
              </span>
            }
            name="duration"
          >
            <InputNumber
              style={{
                width: "100%",
                background: theme === "dark" ? "#2d2d2d" : "#ffffff",
                borderColor: theme === "dark" ? "#3d3d3d" : "#d9d9d9",
                color: theme === "dark" ? "#ffffff" : "#000000",
              }}
              min={1}
              max={180}
              placeholder="Enter duration in minutes"
            />
          </Form.Item>

          <Form.Item
            label={
              <span style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>
                Type
              </span>
            }
            name="main_type"
          >
            <Select
              style={selectStyle}
              className={theme === "dark" ? "dark-select" : ""}
            >
              {MAIN_TYPES.map((type) => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label={
              <span style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>
                Language
              </span>
            }
            name="language"
          >
            <Select
              style={selectStyle}
              className={theme === "dark" ? "dark-select" : ""}
            >
              {LANGUAGES.map((language) => (
                <Option key={language.value} value={language.value}>
                  {language.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label={
              <span style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>
                Tone
              </span>
            }
            name="tone"
          >
            <Select
              style={selectStyle}
              className={theme === "dark" ? "dark-select" : ""}
            >
              {TONES.map((tone) => (
                <Option key={tone.value} value={tone.value}>
                  {tone.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label={
              <span style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>
                Medium
              </span>
            }
            name="medium"
          >
            <Select
              style={selectStyle}
              className={theme === "dark" ? "dark-select" : ""}
            >
              {MEDIUMS.map((medium) => (
                <Option key={medium.value} value={medium.value}>
                  {medium.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label={
              <span style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>
                Occasion
              </span>
            }
            name="occasion"
          >
            <Select
              style={selectStyle}
              className={theme === "dark" ? "dark-select" : ""}
            >
              {OCCASIONS.map((occasion) => (
                <Option key={occasion.value} value={occasion.value}>
                  {occasion.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          label={
            <span style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>
              Target Audience
            </span>
          }
          name="target_audience"
        >
          <Input style={inputStyle} />
        </Form.Item>

        <Form.Item
          label={
            <span style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>
              Objective
            </span>
          }
          name="objective"
        >
          <Input style={inputStyle} />
        </Form.Item>

        <Form.Item
          label={
            <span style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>
              Purpose
            </span>
          }
          name="purpose"
        >
          <Input style={inputStyle} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
