interface UserMessageProps {
  content: string;
}

export const UserMessage: React.FC<UserMessageProps> = ({ content }) => {
  return (
    <div className="flex flex-col items-end mb-4">
      <span className="text-xs text-gray-500 mb-1 mr-1">You</span>
      <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-blue-500 px-4 py-2 text-sm text-white whitespace-pre-wrap break-words shadow-sm">
        {content}
      </div>
    </div>
  );
};
