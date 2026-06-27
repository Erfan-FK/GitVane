"use client";

import type { TreeNode } from "@/lib/file-tree";
import { cn } from "@/lib/utils";
import { ChevronDown, FileText, Folder } from "lucide-react";

export function FileTree({
  root,
  selected,
  onSelect,
}: {
  root: TreeNode;
  selected: string;
  onSelect: (path: string) => void;
}) {
  return (
    <div className="select-none py-1 text-sm">
      {root.children.map((node) => (
        <TreeItem key={node.path} node={node} depth={0} selected={selected} onSelect={onSelect} />
      ))}
    </div>
  );
}

function TreeItem({
  node,
  depth,
  selected,
  onSelect,
}: {
  node: TreeNode;
  depth: number;
  selected: string;
  onSelect: (path: string) => void;
}) {
  const pad = { paddingLeft: `${depth * 14 + 12}px` };

  if (node.type === "dir") {
    return (
      <div>
        <div
          className="flex items-center gap-1.5 py-1.5 text-muted-foreground"
          style={pad}
        >
          <ChevronDown className="size-3.5" />
          <Folder className="size-4" />
          <span className="font-mono text-xs">{node.name}</span>
        </div>
        {node.children.map((child) => (
          <TreeItem
            key={child.path}
            node={child}
            depth={depth + 1}
            selected={selected}
            onSelect={onSelect}
          />
        ))}
      </div>
    );
  }

  const isActive = node.path === selected;
  return (
    <button
      onClick={() => onSelect(node.path)}
      style={pad}
      className={cn(
        "flex w-full items-center gap-1.5 py-1.5 pr-2 text-left transition-colors",
        isActive
          ? "bg-accent font-medium text-foreground"
          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
      )}
    >
      <FileText className="size-4 shrink-0" />
      <span className="truncate font-mono text-xs">{node.name}</span>
    </button>
  );
}
