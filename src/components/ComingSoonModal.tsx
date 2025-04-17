import { Modal } from "antd";
import { useTheme } from "@/contexts/ThemeContext";
import { InfoCircleOutlined } from "@ant-design/icons";

interface ComingSoonModalProps {
  open: boolean;
  onClose: () => void;
  featureTitle: string;
}

export default function ComingSoonModal({
  open,
  onClose,
  featureTitle,
}: ComingSoonModalProps) {
  const { theme } = useTheme();

  return (
    <Modal
      title={
        <span style={{ display: "flex", alignItems: "center" }}>
          <InfoCircleOutlined style={{ marginRight: 8, color: "#1890ff" }} />
          {featureTitle} - Coming Soon!
        </span>
      }
      open={open}
      onCancel={onClose}
      footer={null} // No footer needed
      centered
      styles={{
        header: {
          background: theme === "dark" ? "#1e1e1e" : "#ffffff",
          color: theme === "dark" ? "#ffffff" : "#000000",
        },
        content: {
          background: theme === "dark" ? "#1e1e1e" : "#ffffff",
          color: theme === "dark" ? "#ffffff" : "#000000",
        },
        body: {
          padding: "32px 24px",
        },
      }}
    >
      <p className="text-center text-lg">
        This feature is currently under development and will be available soon.
      </p>
      <p className="text-center mt-4 text-gray-500">
        Thank you for your patience!
      </p>
    </Modal>
  );
}
