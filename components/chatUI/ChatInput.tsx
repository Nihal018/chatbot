import { SendIcon } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { MdAttachFile } from "react-icons/md";
import { VscStopCircle } from "react-icons/vsc";

interface ChatInputProps {
  input: string;
  handleInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    options?: {
      experimental_attachments?: FileList;
    }
  ) => Promise<void>;
  isLoading: boolean;
  stop: () => void;
}

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
}: ChatInputProps) {
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    handleSubmit(event, { experimental_attachments: files });

    setFiles(undefined);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <form onSubmit={onSubmit} className="max-w-4xl mx-auto">
        <div className="relative flex items-center">
          <input
            className="w-full p-3 pr-20 border border-gray-200 rounded-lg 
              text-black focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={input}
            placeholder="Type your message..."
            onChange={handleInputChange}
          />

          <div className="absolute right-12 ">
            <div className="relative ">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 "
                onChange={(event) => {
                  if (event.target.files) {
                    setFiles(event.target.files);
                  }
                }}
                multiple
                ref={fileInputRef}
                aria-label="Attach files"
              />
              <div className="p-2 text-gray-500 hover:text-blue-500 transition-colors ">
                <MdAttachFile className="w-6 h-6 " />
              </div>
            </div>
          </div>

          <div className="absolute right-2">
            {isLoading ? (
              <button
                type="button"
                className="p-2 text-gray-700 hover:text-gray-600 transition-colors"
                onClick={() => stop()}
              >
                <VscStopCircle className="w-6 h-6" />
              </button>
            ) : (
              <button
                type="submit"
                className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
              >
                <SendIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
