import { Menu } from "lucide-react";

interface ChatflowLayoutProps {
  children: React.ReactNode;
  onOpenSidebar: () => void;
}

export function ChatflowLayout({
  children,
  onOpenSidebar,
}: ChatflowLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-white px-4 py-3 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-700 ml-10">AI Chat</h1>
        <button
          onClick={onOpenSidebar}
          className="p-2 text-gray-700 hover:bg-gray-100 rounded-full"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
      {children}
    </div>
  );
}
