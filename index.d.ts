/**
 * Validate relative links, including headings.
 *
 * @returns {(tree: Root, file: VFile) => void}
 */
export default function remarkValidateRelativeLinks(): (
  tree: Root,
  file: VFile
) => void;
import type { Root } from 'mdast';
import type { VFile } from 'vfile';
