import React, { useState } from "react";
import { Modal, Form, Input } from "antd";
import { useTheme } from "@/contexts/ThemeContext";
interface NewFilesModalProps {
  open: boolean;
  onClose: () => void;
  onCreateFile: (fileName: string) => Promise<void>;
}

const NewFileModal: React.FC<NewFilesModalProps> = ({
  open,
  onClose,
  onCreateFile,
}) => {
  const { theme } = useTheme();
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateFile = async () => {
    setLoading(true);
    try {
      await onCreateFile(fileName);
      setFileName("");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFileName("");
    onClose();
  };

  return (
    <Modal
      title="Create New File"
      open={open}
      onCancel={handleCancel}
      onOk={handleCreateFile}
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
        },
      }}
    >
      <div className="text-xs text-gray-500 italic mb-3">
        This will create a new file based on your current content.
      </div>
      <Form layout="vertical">
        <Form.Item label="File Name">
          <Input
            placeholder="Enter file name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default NewFileModal;
