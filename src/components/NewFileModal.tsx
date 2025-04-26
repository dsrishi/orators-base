import React, { useState } from "react";
import { Modal, Form, Input, Radio } from "antd";
interface NewFilesModalProps {
  open: boolean;
  onClose: () => void;
  onCreateFile: (fileName: string, emptyContent: boolean) => Promise<void>;
}

const NewFileModal: React.FC<NewFilesModalProps> = ({
  open,
  onClose,
  onCreateFile,
}) => {
  const [fileName, setFileName] = useState("");
  const [emptyContent, setEmptyContent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateFile = async () => {
    setLoading(true);
    try {
      await onCreateFile(fileName, emptyContent);
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
    >
      <Form layout="vertical">
        <Form.Item label="File Name">
          <Input
            placeholder="Enter file name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
        </Form.Item>
        <Form.Item
          label="File Content"
          extra={
            emptyContent
              ? "Create an empty file."
              : "Create a new file duplicating the current file."
          }
        >
          <Radio.Group
            value={emptyContent}
            onChange={(e) => setEmptyContent(e.target.value)}
          >
            <Radio value={false}>Current File</Radio>
            <Radio value={true}>Empty</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default NewFileModal;
