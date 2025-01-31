import { SendIcon } from "lucide-react";
import Image from "next/image";
import { FormEvent, useRef, useState } from "react";
import { MdAttachFile, MdClose } from "react-icons/md";
import { VscStopCircle } from "react-icons/vsc";

interface ChatInputProps {
  input: string;
  handleInputChange: (text: string) => void;
  handleSubmit: (options?: { files?: FileList }) => Promise<void>;
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
  const [filePreview, setFilePreview] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(event.target.files);

      const previews = Array.from(event.target.files).map((file) => {
        if (file.type.startsWith("image/")) {
          return URL.createObjectURL(file);
        }
        return file.name;
      });
      setFilePreview(previews);
    }
  };

  const removeFile = (index: number) => {
    if (files) {
      const dt = new DataTransfer();
      Array.from(files).forEach((file, i) => {
        if (i !== index) dt.items.add(file);
      });
      setFiles(dt.files);
      const newPreviews = filePreview.filter((_, i) => i !== index);
      setFilePreview(newPreviews);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
        fileInputRef.current.files = dt.files;
      }
    }
  };

  const submitMessage = async () => {
    await handleSubmit({ files });
    setFiles(undefined);
    setFilePreview([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitMessage();
  };

  const onInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    handleInputChange(e.target.value);
  };
  return (
    <div className="bg-white p-4">
      {filePreview.length > 0 && (
        <div className="max-w-4xl mx-auto mb-4 flex flex-wrap gap-2">
          {filePreview.map((preview, index) => (
            <div
              key={index}
              className="relative group border rounded-lg p-2 bg-gray-50"
            >
              {preview.startsWith("data:image/") ||
              preview.startsWith("blob:") ? (
                <Image
                  src={preview}
                  alt="preview"
                  width={80}
                  height={80}
                  className="h-20 w-20 object-cover rounded"
                />
              ) : (
                <div className="h-20 w-20 flex items-center justify-center text-sm text-gray-600">
                  {preview}
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 
                         opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MdClose className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={onSubmit} className="max-w-4xl mx-auto">
        <div className="relative flex items-center">
          <input
            className="w-full p-3 pr-20 border border-gray-200 rounded-lg 
              text-black focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={input}
            placeholder={
              files?.length
                ? `${files.length} file(s) selected...`
                : "Type your message..."
            }
            onChange={onInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submitMessage();
              }
            }}
          />

          <div className="absolute right-12">
            <div className="relative">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0"
                onChange={handleFileSelect}
                multiple
                ref={fileInputRef}
                aria-label="Attach files"
              />
              <div
                className={`p-2 transition-colors ${
                  files?.length
                    ? "text-blue-500"
                    : "text-gray-500 hover:text-blue-500"
                }`}
              >
                <MdAttachFile className="w-6 h-6" />
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
