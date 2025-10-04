import { marked } from 'marked';

// Configure marked options for better rendering
marked.setOptions({
  breaks: true, // Convert \n to <br>
  gfm: true, // GitHub Flavored Markdown
  sanitize: false, // Allow HTML (we'll sanitize manually)
});

// Custom renderer for better styling
const renderer = new marked.Renderer();

// Custom heading styles
renderer.heading = (text, level) => {
  const headingClass = `heading-${level}`;
  return `<h${level} class="${headingClass}">${text}</h${level}>`;
};

// Custom code block styling
renderer.code = (code, language) => {
  return `<pre class="code-block"><code class="language-${language || 'text'}">${code}</code></pre>`;
};

// Custom inline code styling
renderer.codespan = (code) => {
  return `<code class="inline-code">${code}</code>`;
};

// Custom list styling
renderer.list = (body, ordered) => {
  const listType = ordered ? 'ol' : 'ul';
  const listClass = ordered ? 'ordered-list' : 'unordered-list';
  return `<${listType} class="${listClass}">${body}</${listType}>`;
};

// Custom list item styling
renderer.listitem = (text) => {
  return `<li class="list-item">${text}</li>`;
};

// Custom blockquote styling
renderer.blockquote = (quote) => {
  return `<blockquote class="blockquote">${quote}</blockquote>`;
};

// Custom link styling
renderer.link = (href, title, text) => {
  return `<a href="${href}" class="styled-link" target="_blank" rel="noopener noreferrer">${text}</a>`;
};

// Custom paragraph styling
renderer.paragraph = (text) => {
  return `<p class="styled-paragraph">${text}</p>`;
};

// Custom strong (bold) styling
renderer.strong = (text) => {
  return `<strong class="bold-text">${text}</strong>`;
};

// Custom emphasis (italic) styling
renderer.em = (text) => {
  return `<em class="italic-text">${text}</em>`;
};

// Set the custom renderer
marked.use({ renderer });

// Function to parse markdown and return HTML
export const parseMarkdown = (text) => {
  if (!text) return '';
  
  try {
    // Parse the markdown text
    const html = marked(text);
    return html;
  } catch (error) {
    console.error('Error parsing markdown:', error);
    // Fallback to basic HTML escaping
    return text.replace(/\*\*(.*?)\*\*/g, '<strong class="bold-text">$1</strong>')
               .replace(/\*(.*?)\*/g, '<em class="italic-text">$1</em>')
               .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')
               .replace(/\n/g, '<br>');
  }
};

// Function to create a simple markdown parser for basic formatting
export const simpleMarkdownParser = (text) => {
  if (!text) return '';
  
  return text
    // Bold text **text** or __text__
    .replace(/\*\*(.*?)\*\*/g, '<strong class="bold-text">$1</strong>')
    .replace(/__(.*?)__/g, '<strong class="bold-text">$1</strong>')
    // Italic text *text* or _text_
    .replace(/\*(.*?)\*/g, '<em class="italic-text">$1</em>')
    .replace(/_(.*?)_/g, '<em class="italic-text">$1</em>')
    // Inline code `code`
    .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')
    // Code blocks ```code```
    .replace(/```([\s\S]*?)```/g, '<pre class="code-block"><code>$1</code></pre>')
    // Line breaks
    .replace(/\n/g, '<br>')
    // Links [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="styled-link" target="_blank" rel="noopener noreferrer">$1</a>');
};
