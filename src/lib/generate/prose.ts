/**
 * Prose blocks are the only parts of the generated files that benefit from an
 * LLM. Everything else is built deterministically from the RepoProfile. When
 * the LLM is unavailable, deterministic fallbacks (in templates.ts) are used.
 */
export interface ProseBlocks {
  /** 1-2 sentence description of what the repo is and does. */
  summary?: string;
  /** A short paragraph describing the architecture / how it's organized. */
  architecture?: string;
  /** Coding conventions as short imperative bullet strings. */
  conventions?: string[];
  /** Design-system narrative (only when frontend exists). */
  designNotes?: string;
  /** API conventions narrative (only when backend exists). */
  apiNotes?: string;
  /** Extra failure-mode / "be careful" bullets specific to this repo. */
  extraRisks?: string[];
}

export const EMPTY_PROSE: ProseBlocks = {};
