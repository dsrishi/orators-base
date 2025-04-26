import { DeleteOutlined } from "@ant-design/icons";

import { EditOutlined } from "@ant-design/icons";

import { useTheme } from "@/contexts/ThemeContext";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Menu, message, Tooltip } from "antd";
import { SpeechFile } from "@/types/speech";
import { useState } from "react";
import ConfirmationModal from "../ConfirmationModal";
import { speechService } from "@/services/speechService";
import { useUser } from "@/contexts/UserContext";
import NewFileModal from "../NewFileModal";

interface SlateFilesProps {
  files: SpeechFile[];
  selectedFile: SpeechFile;
  setSelectedFile: (file: SpeechFile) => void;
  handleFileChange: (key: string) => void;
  refreshSpeechData: () => Promise<void>;
  speechId: string;
  setCollapsed: (collapsed: boolean) => void;
}

export default function SlateFiles({
  files,
  selectedFile,
  setSelectedFile,
  handleFileChange,
  refreshSpeechData,
  speechId,
  setCollapsed,
}: SlateFilesProps) {
  const { theme } = useTheme();
  const { user } = useUser();
  const [messageApi, contextHolder] = message.useMessage();
  const [newFileModalOpen, setNewFileModalOpen] = useState(false);

  const [editFileId, setEditFileId] = useState<string | null>(null);
  const [editFileName, setEditFileName] = useState("");
  const [confirmDeleteModalVisible, setConfirmDeleteModalVisible] =
    useState(false);
  const [fileToDelete, setFileToDelete] = useState<SpeechFile | null>(null);

  // Sort files by updated_at before setting the initial state
  const sortFilesByRecent = (files: SpeechFile[]) => {
    return [...files].sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  };

  // Select the most recently updated file by default
  const getMostRecentFile = (files: SpeechFile[]) => {
    const sortedFiles = sortFilesByRecent(files);
    return sortedFiles.length > 0 ? sortedFiles[0] : null;
  };

  const handleEditFileClick = (e: React.MouseEvent, file: SpeechFile) => {
    e.stopPropagation(); // Prevent menu item click
    setEditFileId(file.id);
    setEditFileName(file.file_name);
  };

  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditFileName(e.target.value);
  };

  const handleCreateNewFile = async (fileName: string) => {
    if (!user?.id) return;

    const { fileId, error } = await speechService.createNewFile(speechId, {
      fileName: fileName || `File ${files.length + 1}`,
      baseFileId: selectedFile.id,
      userId: user.id,
    });

    if (error) {
      messageApi.error({
        content: "Failed to create new file",
        duration: 3,
      });
      throw error; // This will be caught by the modal
    }

    messageApi.success({
      content: "New file created",
      duration: 2,
    });

    await refreshSpeechData();

    // Find and select the newly created file
    const newFiles = [...files];
    const newFile = newFiles.find((v) => v.id === fileId);
    if (newFile) {
      setSelectedFile(newFile);

      // Make sure the files panel is open to show the new file
      setCollapsed(false);
    }

    setNewFileModalOpen(false);
  };

  const handleFileNameSave = async () => {
    if (!editFileId || !editFileName.trim()) return;

    try {
      const { error } = await speechService.updateFileInfo(editFileId, {
        fileName: editFileName.trim(),
      });

      if (error) {
        messageApi.error({
          content: "Failed to update file name",
          duration: 3,
        });
        return;
      }

      messageApi.success({
        content: "File name updated",
        duration: 2,
      });

      // Refresh to get updated data
      await refreshSpeechData();
    } catch (error) {
      messageApi.error({
        content: error instanceof Error ? error.message : "An error occurred",
        duration: 3,
      });
    } finally {
      setEditFileId(null);
      setEditFileName("");
    }
  };

  const handleDeleteFileClick = (e: React.MouseEvent, file: SpeechFile) => {
    e.stopPropagation(); // Prevent menu item click
    setFileToDelete(file);
    setConfirmDeleteModalVisible(true);
  };

  const handleDeleteFile = async () => {
    if (!fileToDelete) return;

    try {
      const { error } = await speechService.deleteFile(
        speechId,
        fileToDelete.id
      );

      if (error) {
        messageApi.error({
          content: error.message || "Failed to delete file",
          duration: 3,
        });
        return;
      }

      messageApi.success({
        content: "File deleted",
        duration: 2,
      });

      // Refresh files and select the most recent one
      await refreshSpeechData();

      // If we deleted the currently selected file, select the most recent one
      if (fileToDelete.id === selectedFile.id) {
        const updatedFiles = files.filter((v) => v.id !== fileToDelete.id);
        const mostRecentFile = getMostRecentFile(updatedFiles);
        if (mostRecentFile) {
          setSelectedFile(mostRecentFile);
        }
      }
    } catch (error) {
      messageApi.error({
        content: error instanceof Error ? error.message : "An error occurred",
        duration: 3,
      });
    } finally {
      // Close the modal
      setConfirmDeleteModalVisible(false);
      setFileToDelete(null);
    }
  };

  return (
    <>
      {contextHolder}
      <div className="flex justify-between items-center px-4 pt-3 pb-3">
        <div className="text-base font-semibold">Files</div>
        <Tooltip title="Create New File">
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => setNewFileModalOpen(true)}
          />
        </Tooltip>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[selectedFile?.id || ""]}
        style={{
          backgroundColor: theme === "dark" ? "#1e1e1e" : "#ffffff",
          borderRight: 0,
        }}
        theme={theme === "dark" ? "dark" : "light"}
        onClick={({ key }) => handleFileChange(key)}
        items={sortFilesByRecent(files).map((file) => ({
          key: file.id,
          label: (
            <div className="flex items-center justify-between group relative">
              {editFileId === file.id ? (
                <input
                  autoFocus
                  value={editFileName}
                  onChange={handleFileNameChange}
                  onBlur={handleFileNameSave}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleFileNameSave();
                    if (e.key === "Escape") {
                      setEditFileId(null);
                      setEditFileName("");
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-transparent border-gray-400 outline-none px-1 py-0 mr-2"
                  style={{
                    color: theme === "dark" ? "#ffffff" : "#000000",
                  }}
                />
              ) : (
                <>
                  <div className="w-32 truncate">{file.file_name}</div>
                  <div className="hidden group-hover:flex items-center space-x-1 absolute right-0 bg-inherit">
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={(e) => handleEditFileClick(e, file)}
                    />
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => handleDeleteFileClick(e, file)}
                      disabled={files.length <= 1} // Prevent deleting the only file
                    />
                  </div>
                </>
              )}
            </div>
          ),
        }))}
      />

      <NewFileModal
        open={newFileModalOpen}
        onClose={() => setNewFileModalOpen(false)}
        onCreateFile={handleCreateNewFile}
      />

      <ConfirmationModal
        title="Delete File"
        message={`Are you sure you want to delete "${fileToDelete?.file_name}"?`}
        subMessage="This action cannot be undone."
        open={confirmDeleteModalVisible}
        onCancel={() => setConfirmDeleteModalVisible(false)}
        onConfirm={handleDeleteFile}
        confirmText="Delete"
        danger={true}
      />
    </>
  );
}
