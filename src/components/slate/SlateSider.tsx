import { Editor } from "@tiptap/core";
import { SpeechVersion } from "@/types/speech";
import SlateVersions from "./SlateVersions";

interface SlateSiderProps {
  versions: SpeechVersion[];
  selectedVersion: SpeechVersion;
  setSelectedVersion: (version: SpeechVersion) => void;
  handleVersionChange: (key: string) => void;
  refreshSpeechData: () => Promise<void>;
  speechId: string;
  editor: Editor | null;
  setCollapsed: (collapsed: boolean) => void;
}

export default function SlateSider({
  versions,
  selectedVersion,
  setSelectedVersion,
  handleVersionChange,
  refreshSpeechData,
  speechId,
  editor,
  setCollapsed,
}: SlateSiderProps) {
  return (
    <div>
      <SlateVersions
        versions={versions}
        selectedVersion={selectedVersion}
        setSelectedVersion={setSelectedVersion}
        handleVersionChange={handleVersionChange}
        refreshSpeechData={refreshSpeechData}
        speechId={speechId}
        editor={editor}
        setCollapsed={setCollapsed}
      />
    </div>
  );
}
