import React from "react";
import { Modal, Button } from "antd";

interface ConfirmationModalProps {
  title: string;
  message: React.ReactNode;
  subMessage?: React.ReactNode;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  confirmLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  message,
  subMessage,
  open,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  confirmLoading = false,
}) => {
  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {cancelText}
        </Button>,
        <Button
          key="confirm"
          type={danger ? "primary" : "default"}
          danger={danger}
          onClick={onConfirm}
          loading={confirmLoading}
        >
          {confirmText}
        </Button>,
      ]}
      maskClosable={!confirmLoading}
      closable={!confirmLoading}
    >
      <p>{message}</p>
      {subMessage && <p>{subMessage}</p>}
    </Modal>
  );
};

export default ConfirmationModal;
