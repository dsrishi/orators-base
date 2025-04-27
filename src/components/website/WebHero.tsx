import { Button } from "antd";

const WebHero = () => {
  return (
    <>
      <div className="mt-28">
        <div className="text-7xl text-center mb-6 font-logo mt-3">
          Deliver impactful speeches
        </div>
        <div className="text-lg text-gray-400 text-center max-w-2xl mb-4 mx-auto">
          Built to make you extraordinarily productive. OratorsBase is the best
          way to write, organize, and practice impactful speeches.
        </div>
        <div className="flex flex-col md:flex-row gap-3 items-center justify-center mb-16">
          <Button size="large">Login</Button>
          <Button
            type="primary"
            size="large"
            style={{
              border: "none",
              boxShadow: "none",
            }}
            className="primary-gradient-btn"
          >
            Request Access
          </Button>
        </div>
        <div className="flex flex-col md:flex-row gap-6 items-center justify-center mb-16"></div>
      </div>
    </>
  );
};

export default WebHero;
