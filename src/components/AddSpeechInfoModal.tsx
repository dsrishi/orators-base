import { Modal, Form, Input, Select, DatePicker } from "antd";
import { useTheme } from "@/contexts/ThemeContext";
import TextArea from "antd/es/input/TextArea";

interface AddSpeechInfoModalProps {
  open: boolean;
  onClose: () => void;
}

const { Option } = Select;

export default function AddSpeechInfoModal({
  open,
  onClose,
}: AddSpeechInfoModalProps) {
  const { theme } = useTheme();
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      console.log(values);
      form.resetFields();
      onClose();
    });
  };

  return (
    <Modal
      title="Speech Information"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Save"
      cancelText="Cancel"
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
              Speech Title
            </span>
          }
          name="title"
          rules={[{ required: true, message: "Please enter speech title" }]}
        >
          <Input
            style={{
              background: theme === "dark" ? "#2d2d2d" : "#ffffff",
              borderColor: theme === "dark" ? "#3d3d3d" : "#d9d9d9",
              color: theme === "dark" ? "#ffffff" : "#000000",
            }}
          />
        </Form.Item>

        <Form.Item
          label={
            <span style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>
              Category
            </span>
          }
          name="category"
          rules={[{ required: true, message: "Please select a category" }]}
        >
          <Select
            style={{
              background: theme === "dark" ? "#2d2d2d" : "#ffffff",
            }}
            className={theme === "dark" ? "dark-select" : ""}
          >
            <Option value="business">Business</Option>
            <Option value="technical">Technical</Option>
            <Option value="motivational">Motivational</Option>
            <Option value="educational">Educational</Option>
            <Option value="other">Other</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={
            <span style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>
              Event Date
            </span>
          }
          name="eventDate"
        >
          <DatePicker
            style={{
              width: "100%",
              background: theme === "dark" ? "#2d2d2d" : "#ffffff",
              borderColor: theme === "dark" ? "#3d3d3d" : "#d9d9d9",
              color: theme === "dark" ? "#ffffff" : "#000000",
            }}
          />
        </Form.Item>

        <Form.Item
          label={
            <span style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>
              Description
            </span>
          }
          name="description"
        >
          <TextArea
            rows={4}
            style={{
              background: theme === "dark" ? "#2d2d2d" : "#ffffff",
              borderColor: theme === "dark" ? "#3d3d3d" : "#d9d9d9",
              color: theme === "dark" ? "#ffffff" : "#000000",
            }}
          />
        </Form.Item>

        <Form.Item
          label={
            <span style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>
              Target Audience
            </span>
          }
          name="targetAudience"
        >
          <Input
            style={{
              background: theme === "dark" ? "#2d2d2d" : "#ffffff",
              borderColor: theme === "dark" ? "#3d3d3d" : "#d9d9d9",
              color: theme === "dark" ? "#ffffff" : "#000000",
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
