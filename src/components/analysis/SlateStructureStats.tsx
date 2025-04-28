import { Descendant } from "slate";
import { Speech } from "../../types/speech";
import { Descriptions, DescriptionsProps, Statistic } from "antd";
import { Col } from "antd";
import { Row } from "antd";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { getStatsFromHtml } from "@/helpers/statsHelpers";
import { extractSpeechAsHtml } from "@/helpers/speech/extractSpeechAsHtml";
import { useUser } from "@/contexts/UserContext";
import { extractSpeechByStructureAsHtml } from "@/helpers/speech/extractSpeechByStructureAsHtml";

interface SlateStructureStatsProps {
  content: Descendant[];
  speechData: Speech;
}

const SlateStructureStats = ({
  content,
  speechData,
}: SlateStructureStatsProps) => {
  const { user } = useUser();

  const stats = getStatsFromHtml(
    extractSpeechAsHtml(content),
    user?.speaking_pace || 140
  );

  function getStructureStats(structure: string) {
    return getStatsFromHtml(
      extractSpeechByStructureAsHtml(content, structure),
      user?.speaking_pace || 140
    );
  }

  function getDurationStatus() {
    const response = {
      status: "neutral",
      difference: 0,
    };
    if (speechData.duration) {
      const durationInSeconds = speechData.duration
        ? speechData.duration * 60
        : 0;
      const difference = stats.estimatedDurationInSeconds - durationInSeconds;
      const absoluteDifference = Math.abs(difference);
      if (absoluteDifference > 60) {
        response.status = "danger";
      } else if (absoluteDifference > 30) {
        response.status = "warning";
      } else {
        response.status = "success";
      }
      response.difference = difference;
      return response;
    }
    return response;
  }

  const durationItems: DescriptionsProps["items"] = [
    {
      key: "1",
      label: "Opening",
      children: <p>{getStructureStats("opening").estimatedDuration}</p>,
    },
    {
      key: "2",
      label: "Body",
      children: <p>{getStructureStats("body").estimatedDuration}</p>,
    },
    {
      key: "3",
      label: "Conclusion",
      children: <p>{getStructureStats("conclusion").estimatedDuration}</p>,
    },
  ];

  const wordCountItems: DescriptionsProps["items"] = [
    {
      key: "1",
      label: "Opening",
      children: <p>{getStructureStats("opening").wordCount}</p>,
    },
    {
      key: "2",
      label: "Body",
      children: <p>{getStructureStats("body").wordCount}</p>,
    },
    {
      key: "3",
      label: "Conclusion",
      children: <p>{getStructureStats("conclusion").wordCount}</p>,
    },
  ];

  function getWordCountStatus() {
    const response = {
      status: "neutral",
      difference: 0,
    };
    if (speechData.word_count) {
      const difference = stats.wordCount - speechData.word_count;
      const absoluteDifference = Math.abs(difference);
      if (absoluteDifference > 100) {
        response.status = "danger";
      } else if (absoluteDifference > 50) {
        response.status = "warning";
      } else {
        response.status = "success";
      }
      response.difference = difference;
      return response;
    }
    return response;
  }

  return (
    <>
      <Row gutter={24}>
        <Col span={12} className="mb-6">
          <Statistic
            title={
              "Total Duration (" +
              (speechData.duration ? speechData.duration + " min" : "-") +
              ")"
            }
            value={stats.estimatedDuration}
            valueStyle={{
              color:
                getDurationStatus().status === "neutral"
                  ? ""
                  : getDurationStatus().status === "danger"
                  ? "#cf1322"
                  : getDurationStatus().status === "warning"
                  ? "#faad14"
                  : "#3f8600",
            }}
            prefix={
              getDurationStatus().difference === 0 ? (
                ""
              ) : getDurationStatus().difference < 0 ? (
                <ArrowDownOutlined />
              ) : (
                <ArrowUpOutlined />
              )
            }
          />
          <div className="text-sm mt-2">
            <Descriptions
              size="small"
              bordered
              column={1}
              items={durationItems}
            />
          </div>
        </Col>
        <Col span={12} className="mb-6">
          <Statistic
            title={"Total Word Count (" + (speechData.word_count || "-") + ")"}
            value={stats.wordCount}
            valueStyle={{
              color:
                getWordCountStatus().status === "neutral"
                  ? ""
                  : getWordCountStatus().status === "danger"
                  ? "#cf1322"
                  : getWordCountStatus().status === "warning"
                  ? "#faad14"
                  : "#3f8600",
            }}
            prefix={
              getWordCountStatus().difference === 0 ? (
                ""
              ) : getWordCountStatus().difference < 0 ? (
                <ArrowDownOutlined />
              ) : (
                <ArrowUpOutlined />
              )
            }
          />
          <div className="text-sm mt-2">
            <Descriptions
              size="small"
              bordered
              column={1}
              items={wordCountItems}
            />
          </div>
        </Col>
      </Row>
    </>
  );
};

export default SlateStructureStats;
