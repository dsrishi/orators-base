import { Drawer } from "antd";
import { useTheme } from "@/contexts/ThemeContext";
import { Speech } from "@/types/speech";
import { Descendant } from "slate";
import SlateBasicStats from "../analysis/SlateBasicStats";
import StructuresStats from "../analysis/StructuresStats";
interface SlateAnalyseDrawerProps {
  open: boolean;
  onClose: () => void;
  speechData: Speech;
  content: Descendant[];
}

export default function SlateAnalyseDrawer({
  open,
  onClose,
  speechData,
  content,
}: SlateAnalyseDrawerProps) {
  const { theme } = useTheme();

  return (
    <Drawer
      title={`Speech Analysis for ${speechData.title}`}
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
      <SlateBasicStats content={content} speechData={speechData} />
      <StructuresStats content={content} speechData={speechData} />
    </Drawer>
  );
}
