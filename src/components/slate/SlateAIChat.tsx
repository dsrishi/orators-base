interface SlateAIChatProps {
  chatCollapsed: boolean;
}

export default function SlateAIChat({ chatCollapsed }: SlateAIChatProps) {
  return (
    <>
      {!chatCollapsed && (
        <div
          className="flex flex-col items-center justify-center p-3"
          style={{ height: "calc(100vh - 110px)" }}
        >
          <h1 className="text-lg font-bold">AI Chat</h1>
          <div className="text-center text-base text-gray-500">
            Craft your speech with AI assistance.
          </div>
          <p className="text-center mt-2 text-gray-500 italic">
            This feature is currently under development and will be available
            soon.
          </p>
          <p className="text-center text-gray-500 text-sm italic">
            Thank you for your patience!
          </p>
        </div>
      )}
    </>
  );
}
