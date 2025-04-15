import { Drawer } from "antd";
import { useTheme } from "@/contexts/ThemeContext";
import { Editor } from "@tiptap/react";
import { Speech } from "@/types/speech";
import BasicStats from "./analysis/BasicStats";

interface SpeechAnalysisDrawerProps {
  open: boolean;
  onClose: () => void;
  editor: Editor | null;
  speechData: Speech;
}

export default function SpeechAnalysisDrawer({
  open,
  onClose,
  editor,
  speechData,
}: SpeechAnalysisDrawerProps) {
  const { theme } = useTheme();

  return (
    <Drawer
      title="Speech Analysis"
      placement="right"
      width={900}
      onClose={onClose}
      open={open}
      styles={{
        header: {
          background: theme === "dark" ? "#1e1e1e" : "#ffffff",
          color: theme === "dark" ? "#ffffff" : "#000000",
          borderBottom:
            theme === "dark" ? "1px solid #2d2d2d" : "1px solid #f0f0f0",
        },
        body: {
          background: theme === "dark" ? "#1e1e1e" : "#ffffff",
          color: theme === "dark" ? "#ffffff" : "#000000",
          padding: "24px",
        },
        mask: {
          background: "rgba(0, 0, 0, 0.45)",
        },
        wrapper: {
          background: theme === "dark" ? "#1e1e1e" : "#ffffff",
        },
        footer: {
          background: theme === "dark" ? "#1e1e1e" : "#ffffff",
          borderTop:
            theme === "dark" ? "1px solid #2d2d2d" : "1px solid #f0f0f0",
        },
      }}
    >
      <BasicStats editor={editor} speechData={speechData} />
    </Drawer>
  );
}
