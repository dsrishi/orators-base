import { DeleteOutlined } from "@ant-design/icons";

import { EditOutlined } from "@ant-design/icons";

import { useTheme } from "@/contexts/ThemeContext";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Menu, message, Tooltip } from "antd";
import { SpeechVersion } from "@/types/speech";
import { useState } from "react";
import ConfirmationModal from "../ConfirmationModal";
import { speechService } from "@/services/speechService";
import NewVersionModal from "../NewVersionModal";
import { useUser } from "@/contexts/UserContext";
import { Editor } from "@tiptap/core";

interface SlateVersionsProps {
  versions: SpeechVersion[];
  selectedVersion: SpeechVersion;
  setSelectedVersion: (version: SpeechVersion) => void;
  handleVersionChange: (key: string) => void;
  refreshSpeechData: () => Promise<void>;
  speechId: string;
  editor: Editor | null;
  setCollapsed: (collapsed: boolean) => void;
}

export default function SlateVersions({
  versions,
  selectedVersion,
  setSelectedVersion,
  handleVersionChange,
  refreshSpeechData,
  speechId,
  editor,
  setCollapsed,
}: SlateVersionsProps) {
  const { theme } = useTheme();
  const { user } = useUser();
  const [messageApi, contextHolder] = message.useMessage();
  const [newVersionModalOpen, setNewVersionModalOpen] = useState(false);

  const [editVersionId, setEditVersionId] = useState<string | null>(null);
  const [editVersionName, setEditVersionName] = useState("");
  const [confirmDeleteModalVisible, setConfirmDeleteModalVisible] =
    useState(false);
  const [versionToDelete, setVersionToDelete] = useState<SpeechVersion | null>(
    null
  );

  // Sort versions by updated_at before setting the initial state
  const sortVersionsByRecent = (versions: SpeechVersion[]) => {
    return [...versions].sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  };

  // Select the most recently updated version by default
  const getMostRecentVersion = (versions: SpeechVersion[]) => {
    const sortedVersions = sortVersionsByRecent(versions);
    return sortedVersions.length > 0 ? sortedVersions[0] : null;
  };

  const handleEditVersionClick = (
    e: React.MouseEvent,
    version: SpeechVersion
  ) => {
    e.stopPropagation(); // Prevent menu item click
    setEditVersionId(version.id);
    setEditVersionName(version.version_name);
  };

  const handleVersionNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditVersionName(e.target.value);
  };

  const handleCreateNewVersion = async (versionName: string) => {
    if (!user?.id) return;

    const { versionId, error } = await speechService.createNewVersion(
      speechId,
      {
        versionName: versionName || `Version ${versions.length + 1}`,
        baseVersionId: selectedVersion.id,
        userId: user.id,
      }
    );

    if (error) {
      messageApi.error({
        content: "Failed to create new version",
        duration: 3,
      });
      throw error; // This will be caught by the modal
    }

    messageApi.success({
      content: "New version created",
      duration: 2,
    });

    await refreshSpeechData();

    // Find and select the newly created version
    const newVersions = [...versions];
    const newVersion = newVersions.find((v) => v.id === versionId);
    if (newVersion) {
      setSelectedVersion(newVersion);

      // Make sure the versions panel is open to show the new version
      setCollapsed(false);

      // If editor exists, focus it to provide a seamless experience
      if (editor) {
        setTimeout(() => editor.commands.focus(), 100);
      }
    }

    setNewVersionModalOpen(false);
  };

  const handleVersionNameSave = async () => {
    if (!editVersionId || !editVersionName.trim()) return;

    try {
      const { error } = await speechService.updateVersionInfo(editVersionId, {
        versionName: editVersionName.trim(),
      });

      if (error) {
        messageApi.error({
          content: "Failed to update version name",
          duration: 3,
        });
        return;
      }

      messageApi.success({
        content: "Version name updated",
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
      setEditVersionId(null);
      setEditVersionName("");
    }
  };

  const handleDeleteVersionClick = (
    e: React.MouseEvent,
    version: SpeechVersion
  ) => {
    e.stopPropagation(); // Prevent menu item click
    setVersionToDelete(version);
    setConfirmDeleteModalVisible(true);
  };

  const handleDeleteVersion = async () => {
    if (!versionToDelete) return;

    try {
      const { error } = await speechService.deleteVersion(
        speechId,
        versionToDelete.id
      );

      if (error) {
        messageApi.error({
          content: error.message || "Failed to delete version",
          duration: 3,
        });
        return;
      }

      messageApi.success({
        content: "Version deleted",
        duration: 2,
      });

      // Refresh versions and select the most recent one
      await refreshSpeechData();

      // If we deleted the currently selected version, select the most recent one
      if (versionToDelete.id === selectedVersion.id) {
        const updatedVersions = versions.filter(
          (v) => v.id !== versionToDelete.id
        );
        const mostRecentVersion = getMostRecentVersion(updatedVersions);
        if (mostRecentVersion) {
          setSelectedVersion(mostRecentVersion);
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
      setVersionToDelete(null);
    }
  };

  return (
    <>
      {contextHolder}
      <div className="flex justify-between items-center px-4 pt-6 pb-3">
        <div className="text-lg font-semibold">Versions</div>
        <Tooltip title="Create New Version">
          <Button
            icon={<PlusOutlined />}
            onClick={() => setNewVersionModalOpen(true)}
          />
        </Tooltip>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[selectedVersion?.id || ""]}
        style={{
          backgroundColor: theme === "dark" ? "#212121" : "#fafafa",
          borderRight: 0,
        }}
        theme={theme === "dark" ? "dark" : "light"}
        onClick={({ key }) => handleVersionChange(key)}
        items={sortVersionsByRecent(versions).map((version) => ({
          key: version.id,
          label: (
            <div className="flex items-center justify-between group relative">
              {editVersionId === version.id ? (
                <input
                  autoFocus
                  value={editVersionName}
                  onChange={handleVersionNameChange}
                  onBlur={handleVersionNameSave}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleVersionNameSave();
                    if (e.key === "Escape") {
                      setEditVersionId(null);
                      setEditVersionName("");
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-transparent border-b border-gray-400 outline-none px-1 py-0 mr-2"
                  style={{
                    color: theme === "dark" ? "#ffffff" : "#000000",
                  }}
                />
              ) : (
                <>
                  <div className="w-32 truncate">{version.version_name}</div>
                  <div className="hidden group-hover:flex items-center space-x-1 absolute right-0 bg-inherit">
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={(e) => handleEditVersionClick(e, version)}
                    />
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => handleDeleteVersionClick(e, version)}
                      disabled={versions.length <= 1} // Prevent deleting the only version
                    />
                  </div>
                </>
              )}
            </div>
          ),
        }))}
      />

      <NewVersionModal
        open={newVersionModalOpen}
        onClose={() => setNewVersionModalOpen(false)}
        onCreateVersion={handleCreateNewVersion}
      />

      <ConfirmationModal
        title="Delete Version"
        message={`Are you sure you want to delete "${versionToDelete?.version_name}"?`}
        subMessage="This action cannot be undone."
        open={confirmDeleteModalVisible}
        onCancel={() => setConfirmDeleteModalVisible(false)}
        onConfirm={handleDeleteVersion}
        confirmText="Delete"
        danger={true}
      />
    </>
  );
}
