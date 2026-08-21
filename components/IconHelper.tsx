import React from "react";
import { 
  CaseSensitive, 
  Binary, 
  FileJson, 
  ImageDown, 
  RefreshCw, 
  Palette, 
  ShieldCheck, 
  FileText, 
  Wrench,
  Sparkles,
  Layers,
  Code2,
  Cpu,
  QrCode,
  KeyRound,
  FileCode2,
  Terminal,
  Compass,
  FolderGit2,
  Video,
  DownloadCloud,
  ShieldAlert,
  Film
} from "lucide-react";

interface IconHelperProps {
  name: string;
  className?: string;
}

export const IconHelper: React.FC<IconHelperProps> = ({ name, className = "w-5 h-5" }) => {
  switch (name) {
    case "CaseSensitive":
      return <CaseSensitive className={className} />;
    case "Binary":
      return <Binary className={className} />;
    case "FileJson":
      return <FileJson className={className} />;
    case "ImageDown":
      return <ImageDown className={className} />;
    case "RefreshCw":
      return <RefreshCw className={className} />;
    case "Palette":
      return <Palette className={className} />;
    case "ShieldCheck":
      return <ShieldCheck className={className} />;
    case "FileText":
      return <FileText className={className} />;
    case "Sparkles":
      return <Sparkles className={className} />;
    case "Layers":
      return <Layers className={className} />;
    case "Code2":
      return <Code2 className={className} />;
    case "Cpu":
      return <Cpu className={className} />;
    case "QrCode":
      return <QrCode className={className} />;
    case "KeyRound":
      return <KeyRound className={className} />;
    case "FileCode2":
      return <FileCode2 className={className} />;
    case "Terminal":
      return <Terminal className={className} />;
    case "Compass":
      return <Compass className={className} />;
    case "FolderGit2":
      return <FolderGit2 className={className} />;
    case "Video":
    case "DownloadCloud":
    case "Film":
      return <DownloadCloud className={className} />;
    default:
      return <Wrench className={className} />;
  }
};
