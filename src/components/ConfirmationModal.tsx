import React, { useState } from "react";
import { Modal, Button, Input } from "antd";

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

export const HardConfirmationModal: React.FC<ConfirmationModalProps> = ({
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
  const [confirmationInput, setConfirmationInput] = useState("");
  const [confirmationInputError, setConfirmationInputError] = useState(false);

  const handleConfirm = () => {
    if (confirmationInput === "delete") {
      onConfirm();
    } else {
      setConfirmationInputError(true);
    }
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      destroyOnClose={true}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {cancelText}
        </Button>,
        <Button
          key="confirm"
          type={danger ? "primary" : "default"}
          danger={danger}
          onClick={handleConfirm}
          loading={confirmLoading}
        >
          {confirmText}
        </Button>,
      ]}
      maskClosable={!confirmLoading}
      closable={!confirmLoading}
    >
      <p>{message}</p>
      {subMessage && (
        <p className="italic text-gray-500 text-xs mb-3">{subMessage}</p>
      )}
      <Input
        placeholder="Type 'delete' to delete"
        onChange={(e) => {
          setConfirmationInput(e.target.value);
          setConfirmationInputError(false);
        }}
        status={confirmationInputError ? "error" : undefined}
      />
    </Modal>
  );
};
