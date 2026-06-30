import type { GeneratedFile } from "@/lib/types";

export interface TreeNode {
  name: string;
  path: string;
  type: "file" | "dir";
  children: TreeNode[];
  /** Present on file leaves: the billing tier of the generated file. */
  tier?: "free" | "premium";
}

/** Builds a nested directory tree from a flat list of generated files. */
export function buildFileTree(files: GeneratedFile[]): TreeNode {
  const root: TreeNode = { name: "", path: "", type: "dir", children: [] };

  for (const file of files) {
    const segments = file.path.split("/");
    let current = root;
    let acc = "";

    segments.forEach((seg, idx) => {
      acc = acc ? `${acc}/${seg}` : seg;
      const isLeaf = idx === segments.length - 1;
      let next = current.children.find((c) => c.name === seg);
      if (!next) {
        next = {
          name: seg,
          path: acc,
          type: isLeaf ? "file" : "dir",
          children: [],
          ...(isLeaf ? { tier: file.tier } : {}),
        };
        current.children.push(next);
      }
      current = next;
    });
  }

  sortTree(root);
  return root;
}

function sortTree(node: TreeNode) {
  node.children.sort((a, b) => {
    if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  node.children.forEach(sortTree);
}
