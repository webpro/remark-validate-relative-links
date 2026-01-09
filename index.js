import { visit } from 'unist-util-visit';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

/**
 * @import { Root, Heading } from 'mdast'
 * @import { VFile } from 'vfile'
 */

const NAME = 'remark-validate-relative-links';

/**
 * Validate relative links, including headings.
 *
 * @returns {(tree: Root, file: VFile) => void}
 */
export default function remarkValidateRelativeLinks() {
  return (tree, file) => {
    const filePath = file.path ? resolve(file.cwd, file.path) : null;
    if (!filePath) return;

    const fileDir = dirname(filePath);

    /** @type {Set<string>} */
    const currentHeadings = new Set();
    visit(tree, 'heading', node => {
      const text = getHeadingText(node);
      if (text) currentHeadings.add(slugify(text));
    });

    visit(tree, ['link', 'image', 'definition'], node => {
      const url = node.url;
      if (!url) return;

      if (url.startsWith('#')) {
        const slug = url.slice(1).toLowerCase();
        if (!currentHeadings.has(slug)) {
          file.message(
            `Cannot find heading \`${url}\` in this file`,
            node,
            `${NAME}:missing-heading`
          );
        }
        return;
      }

      if (url.startsWith('/') || URL.canParse(url)) return;

      const hashIndex = url.indexOf('#');
      const urlPath = hashIndex === -1 ? url : url.slice(0, hashIndex);
      const hash = hashIndex === -1 ? null : url.slice(hashIndex + 1);
      const targetPath = urlPath ? resolve(fileDir, urlPath) : filePath;

      if (urlPath && !existsSync(targetPath)) {
        file.message(
          `Cannot find file \`${urlPath}\``,
          node,
          `${NAME}:missing-file`
        );
        return;
      }

      if (hash) {
        const headings = getHeadingsFromFile(targetPath);
        if (headings && !headings.has(hash.toLowerCase())) {
          file.message(
            `Cannot find heading \`#${hash}\` in \`${urlPath || 'this file'}\``,
            node,
            `${NAME}:missing-heading`
          );
        }
      }
    });
  };
}

/**
 * @param {string} filePath
 * @returns {Set<string> | undefined}
 */
function getHeadingsFromFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    /** @type {Set<string>} */
    const headings = new Set();
    const headingRegex = /^#{1,6}\s+(.+)$/gm;
    let match;
    while ((match = headingRegex.exec(content)) !== null) {
      headings.add(slugify(match[1]));
    }
    return headings;
  } catch {}
}

/**
 * @param {Heading} node
 * @returns {string}
 */
function getHeadingText(node) {
  let text = '';
  visit(node, ['text', 'inlineCode'], textNode => {
    text += textNode.value;
  });
  return text;
}

/**
 * @param {string} text
 * @returns {string}
 */
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s/g, '-')
    .trim();
}
