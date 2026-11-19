/**
 * SOGC Clean Word Paste - Core Sanitizer
 * Pure vanilla JavaScript with zero dependencies.
 */
window.SOGCCleanWordCore = (function () {
  'use strict';

  /**
   * Cleans bloated HTML from Microsoft Word / Office 365
   */
  function clean(rawHtml) {
    if (!rawHtml || typeof rawHtml !== 'string') return rawHtml;

    // Fast check: If it doesn't look like HTML or Word/Office markup, return original
    const isWordContent =
      /class=["']?Mso|xmlns:o=|xmlns:w=|<!--\[if|data-listid|data-aria-|data-leveltext|mso-|font-family/i.test(rawHtml);

    let cleaned = rawHtml;

    // 1. Extract content between <!--StartFragment--> and <!--EndFragment--> if Word included it
    const fragmentMatch = cleaned.match(/<!--StartFragment-->([\s\S]*?)<!--EndFragment-->/i);
    if (fragmentMatch && fragmentMatch[1]) {
      cleaned = fragmentMatch[1];
    }

    // 2. Remove comments
    cleaned = cleaned.replace(/<!--[\s\S]*?-->/gi, '');

    // 3. Remove meta, link, xml, style, script
    cleaned = cleaned.replace(/<(meta|link)[^>]*>/gi, '');
    cleaned = cleaned.replace(/<xml[\s\S]*?<\/xml>/gi, '');
    cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, '');
    cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, '');

    // 4. Remove Office namespace tags (<o:p>, <w:*, <m:*, etc.)
    cleaned = cleaned.replace(/<\/?\w+:[^>]*>/gi, '');

    // Create a temporary detached container
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = cleaned;

    // Allowed tags in standard WordPress WYSIWYG
    const allowedTags = new Set([
      'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
      'STRONG', 'B', 'EM', 'I', 'U', 'S',
      'UL', 'OL', 'LI',
      'TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'TH', 'TD',
      'BLOCKQUOTE', 'PRE', 'CODE', 'A', 'BR', 'HR'
    ]);

    // Allowed attributes strictly for specific tags
    const allowedAttributes = {
      'A': ['href', 'title', 'target'],
      'TD': ['colspan', 'rowspan'],
      'TH': ['colspan', 'rowspan']
    };

    function unwrap(node) {
      const parent = node.parentNode;
      if (!parent) return;
      while (node.firstChild) {
        parent.insertBefore(node.firstChild, node);
      }
      parent.removeChild(node);
    }

    function processNode(node) {
      if (!node) return;

      for (let i = node.childNodes.length - 1; i >= 0; i--) {
        processNode(node.childNodes[i]);
      }

      if (node.nodeType === Node.ELEMENT_NODE && node !== tempContainer) {
        const tagName = node.tagName.toUpperCase();

        // 1. Unwrap span and font tags
        if (tagName === 'SPAN' || tagName === 'FONT') {
          unwrap(node);
          return;
        }

        // 2. Unwrap non-whitelisted tags (divs, sections, headers, etc.)
        if (!allowedTags.has(tagName)) {
          unwrap(node);
          return;
        }

        // 3. Strip all attributes not in allowed list (aria-*, data-*, class, style, id, etc.)
        const permitted = allowedAttributes[tagName] || [];
        const attrs = Array.from(node.attributes);
        for (const attr of attrs) {
          const attrName = attr.name.toLowerCase();
          if (!permitted.includes(attrName)) {
            node.removeAttribute(attr.name);
          } else if (attrName === 'href') {
            if (/^\s*javascript:/i.test(attr.value)) {
              node.removeAttribute('href');
            }
          }
        }

        // 4. Semantic normalization: <b> -> <strong>, <i> -> <em>
        if (tagName === 'B') {
          const strong = document.createElement('strong');
          strong.innerHTML = node.innerHTML;
          if (node.parentNode) {
            node.parentNode.replaceChild(strong, node);
          }
        } else if (tagName === 'I') {
          const em = document.createElement('em');
          em.innerHTML = node.innerHTML;
          if (node.parentNode) {
            node.parentNode.replaceChild(em, node);
          }
        }
      }
    }

    processNode(tempContainer);

    let result = tempContainer.innerHTML;

    // Helper: Merge adjacent list elements (both <ul> and <ol>) repeatedly
    function mergeConsecutiveLists(html) {
      let prev;
      do {
        prev = html;
        // Direct or whitespace-only between lists
        html = html.replace(/<\/ul>\s*<ul>/gi, '');
        html = html.replace(/<\/ol>\s*<ol>/gi, '');
        // Empty paragraphs or &nbsp; between lists
        html = html.replace(/<\/ul>(\s*(?:<p[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>\s*)+)<ul>/gi, '');
        html = html.replace(/<\/ol>(\s*(?:<p[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>\s*)+)<ol>/gi, '');
        // Any intermediate whitespace or empty wrappers
        html = html.replace(/<\/ul>([\s\S]*?)<ul>/gi, function (match, middle) {
          const stripped = middle.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '').trim();
          return stripped === '' ? '' : match;
        });
        html = html.replace(/<\/ol>([\s\S]*?)<ol>/gi, function (match, middle) {
          const stripped = middle.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '').trim();
          return stripped === '' ? '' : match;
        });
      } while (html !== prev);
      return html;
    }

    result = mergeConsecutiveLists(result);

    // Remove zero-width characters & BOM
    result = result.replace(/[\u200B-\u200D\uFEFF]/g, '');
    // Remove empty paragraphs
    result = result.replace(/<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '');

    // Final pass of list merging
    result = mergeConsecutiveLists(result);

    return result.trim();
  }

  return {
    clean: clean
  };
})();
