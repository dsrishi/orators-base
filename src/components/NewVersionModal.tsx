import React, { useState } from "react";
import { Modal, Form, Input, Typography } from "antd";
import { useTheme } from "@/contexts/ThemeContext";

const { Text } = Typography;

interface NewVersionModalProps {
  open: boolean;
  onClose: () => void;
  onCreateVersion: (versionName: string) => Promise<void>;
}

const NewVersionModal: React.FC<NewVersionModalProps> = ({
  open,
  onClose,
  onCreateVersion,
}) => {
  const { theme } = useTheme();
  const [versionName, setVersionName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateVersion = async () => {
    setLoading(true);
    try {
      await onCreateVersion(versionName);
      setVersionName("");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setVersionName("");
    onClose();
  };

  return (
    <Modal
      title="Create New Version"
      open={open}
      onCancel={handleCancel}
      onOk={handleCreateVersion}
      okText="Create"
      confirmLoading={loading}
      styles={{
        header: {
          background: theme === "dark" ? "#1e1e1e" : "#ffffff",
          color: theme === "dark" ? "#ffffff" : "#000000",
        },
        content: {
          background: theme === "dark" ? "#1e1e1e" : "#ffffff",
          color: theme === "dark" ? "#ffffff" : "#000000",
        },
        footer: {
          background: theme === "dark" ? "#1e1e1e" : "#ffffff",
          borderTop:
            theme === "dark" ? "1px solid #2d2d2d" : "1px solid #f0f0f0",
        },
      }}
    >
      <Form layout="vertical">
        <Form.Item label="Version Name" required>
          <Input
            placeholder="Enter version name"
            value={versionName}
            onChange={(e) => setVersionName(e.target.value)}
          />
        </Form.Item>
        <Text type="secondary">
          This will create a new version based on your current content.
        </Text>
      </Form>
    </Modal>
  );
};

export default NewVersionModal;
