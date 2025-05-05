
import React from "react";
import { Folder } from "lucide-react";

const FileExplorer = () => {
  // Mock file data - in a real app, this would come from your backend
  const files = [
    { id: 1, name: "IMG_20250428_232457.txt", type: "txt" }
  ];

  return (
    <div className="bg-gray-100 p-4 rounded-md h-full">
      <h3 className="font-medium mb-3">Files</h3>
      <ul className="space-y-2">
        {files.map((file) => (
          <li key={file.id} className="flex items-center gap-2 text-sm">
            <Folder size={16} />
            <span>{file.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileExplorer;
