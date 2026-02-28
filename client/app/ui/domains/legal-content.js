const legalDocumentMap = {
  tos: {
    title: 'Terms of Service',
    path: '/legal/terms-of-service.md'
  },
  privacy: {
    title: 'Privacy Policy',
    path: '/legal/privacy-policy.md'
  }
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function loadLegalDocument(type) {
  const documentConfig = legalDocumentMap[type] || legalDocumentMap.tos;

  const response = await fetch(documentConfig.path);
  if (!response.ok) {
    throw new Error(`Failed to load ${documentConfig.title}`);
  }

  const markdown = await response.text();

  return {
    title: documentConfig.title,
    content: `<pre class="legal-document">${escapeHtml(markdown)}</pre>`
  };
}
