import { Descendant } from "slate";
import { Descriptions, DescriptionsProps } from "antd";
import { Col } from "antd";
import { getStatsFromHtml } from "@/helpers/statsHelpers";
import { useUser } from "@/contexts/UserContext";
import { extractSpeechByStructureAsHtml } from "@/helpers/speech/extractSpeechByStructureAsHtml";
import { extractSpeechAsHtml } from "@/helpers/speech/extractSpeechAsHtml";

interface StructureStatsProps {
  content: Descendant[];
  structure: string;
}

const StructureStats = ({ content, structure }: StructureStatsProps) => {
  const { user } = useUser();

  const stats = getStatsFromHtml(
    structure === "Total"
      ? extractSpeechAsHtml(content)
      : extractSpeechByStructureAsHtml(content, structure.toLowerCase()),
    user?.speaking_pace || 140
  );

  const items: DescriptionsProps["items"] = [
    {
      key: "1",
      label: "Average Word Length",
      children: <p>{stats.averageWordLength} characters</p>,
    },
    {
      key: "2",
      label: "Sentence Count",
      children: <p>{stats.sentenceCount}</p>,
    },
    {
      key: "3",
      label: "Average Sentence Length",
      children: <p>{stats.averageSentenceLength} words</p>,
    },
    {
      key: "4",
      label: "Paragraph Count",
      children: <p>{stats.paragraphCount}</p>,
    },
    {
      key: "5",
      label: "Average Paragraph Length",
      children: <p>{stats.averageParagraphLength} words</p>,
    },
  ];

  return (
    <Col span={12} className="mb-6">
      <Descriptions
        title={structure}
        size="small"
        bordered
        column={1}
        items={items}
      />
    </Col>
  );
};

export default StructureStats;
