"use client";

import { useState } from "react";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Download, LoaderCircle } from "lucide-react";
import type { GeneratedFile } from "@/lib/types";

export function DownloadButton({
  files,
  repo,
}: {
  files: GeneratedFile[];
  repo: string;
}) {
  const [busy, setBusy] = useState(false);

  async function download() {
    setBusy(true);
    try {
      const zip = new JSZip();
      for (const file of files) {
        zip.file(file.path, file.content);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${repo}-agent-files.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button onClick={download} disabled={busy} size="sm">
      {busy ? <LoaderCircle className="animate-spin" /> : <Download />}
      Download all
    </Button>
  );
}
