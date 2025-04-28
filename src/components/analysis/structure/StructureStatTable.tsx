import { useUser } from "@/contexts/UserContext";
import { extractSpeechAsHtml } from "@/helpers/speech/extractSpeechAsHtml";
import { extractSpeechByStructureAsHtml } from "@/helpers/speech/extractSpeechByStructureAsHtml";
import { getStatsFromHtml } from "@/helpers/statsHelpers";
import { Table } from "antd";
import { Descendant } from "slate";

interface StructureStatTableProps {
  content: Descendant[];
}

const StructureStatTable = ({ content }: StructureStatTableProps) => {
  const { user } = useUser();

  function getStats(structure: string) {
    return getStatsFromHtml(
      structure === "total"
        ? extractSpeechAsHtml(content)
        : extractSpeechByStructureAsHtml(content, structure.toLowerCase()),
      user?.speaking_pace || 140
    );
  }

  const columns = [
    {
      key: "stats",
      title: "",
      dataIndex: "stats",
    },
    {
      key: "total",
      title: "Total",
      dataIndex: "total",
    },
    {
      key: "opening",
      title: "Opening",
      dataIndex: "opening",
    },
    {
      key: "body",
      title: "Body",
      dataIndex: "body",
    },
    {
      key: "conclusion",
      title: "Conclusion",
      dataIndex: "conclusion",
    },
  ];

  const data = [
    {
      key: "1",
      stats: "Average Word Length",
      total: getStats("total").averageWordLength + " chars",
      opening: getStats("opening").averageWordLength + " chars",
      body: getStats("body").averageWordLength + " chars",
      conclusion: getStats("conclusion").averageWordLength + " chars",
    },
    {
      key: "2",
      stats: "Sentence Count",
      total: getStats("total").sentenceCount,
      opening: getStats("opening").sentenceCount,
      body: getStats("body").sentenceCount,
      conclusion: getStats("conclusion").sentenceCount,
    },
    {
      key: "3",
      stats: "Average Sentence Length",
      total: getStats("total").averageSentenceLength + " words",
      opening: getStats("opening").averageSentenceLength + " words",
      body: getStats("body").averageSentenceLength + " words",
      conclusion: getStats("conclusion").averageSentenceLength + " words",
    },
    {
      key: "4",
      stats: "Paragraph Count",
      total: getStats("total").paragraphCount,
      opening: getStats("opening").paragraphCount,
      body: getStats("body").paragraphCount,
      conclusion: getStats("conclusion").paragraphCount,
    },
    {
      key: "5",
      stats: "Average Paragraph Length",
      total: getStats("total").averageParagraphLength + " words",
      opening: getStats("opening").averageParagraphLength + " words",
      body: getStats("body").averageParagraphLength + " words",
      conclusion: getStats("conclusion").averageParagraphLength + " words",
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      pagination={false}
      bordered
      size="small"
    />
  );
};

export default StructureStatTable;
