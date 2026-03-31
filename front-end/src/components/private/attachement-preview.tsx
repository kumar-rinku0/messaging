const AttachmentPreview = ({ url }: { url: string }) => {
  const type = getFileType(url);
  const fileName = getFileName(url);

  if (type === "image") {
    return (
      <img
        src={url}
        alt="attachment"
        className="rounded-lg max-w-[220px] cursor-pointer"
        onClick={() => window.open(url, "_blank")}
      />
    );
  }

  if (type === "video") {
    return <video src={url} controls className="rounded-lg max-w-[220px]" />;
  }

  if (type === "audio") {
    return (
      <div
        onClick={() => window.open(url, "_blank")}
        className="flex items-center gap-2 bg-white/20 rounded-lg p-2 cursor-pointer max-w-[220px]"
      >
        <span className="text-lg">🔉</span>
        <span className="truncate text-xs">{fileName}</span>
      </div>
    );
  }

  if (type === "pdf") {
    return (
      <div
        onClick={() => window.open(url, "_blank")}
        className="flex items-center gap-2 bg-white/20 rounded-lg p-2 cursor-pointer max-w-[220px]"
      >
        <span className="text-lg">📄</span>
        <span className="truncate text-xs">{fileName}</span>
      </div>
    );
  }

  if (type === "doc") {
    return (
      <div
        onClick={() => window.open(url, "_blank")}
        className="flex items-center gap-2 bg-white/20 rounded-lg p-2 cursor-pointer max-w-[220px]"
      >
        <span className="text-lg">📄</span>
        <span className="truncate text-xs">{fileName}</span>
      </div>
    );
  }

  return (
    <div
      onClick={() => window.open(url, "_blank")}
      className="flex items-center gap-2 bg-white/20 rounded-lg p-2 cursor-pointer max-w-[220px]"
    >
      <span>📎</span>
      <span className="truncate text-xs">{fileName}</span>
    </div>
  );
};

const getFileType = (url: string) => {
  const ext = url.split(".").pop()?.toLowerCase() || "";

  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
  if (["mp4", "webm", "ogg", "mov"].includes(ext)) return "video";
  if (["mp3", "wav", "ogg", "m4a"].includes(ext)) return "audio";
  if (["pdf"].includes(ext)) return "pdf";
  if (["doc", "docx"].includes(ext)) return "doc";

  return "file";
};

const getFileName = (url: string) => url.split("/").pop();

export default AttachmentPreview;
