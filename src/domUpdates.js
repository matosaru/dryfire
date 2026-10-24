/** Resolve each time: React ownership may replace nodes after startup. */
export function selectNode(selector, doc = document) {
  return /^#[A-Za-z][\w-]*$/.test(selector) ? doc.getElementById(selector.slice(1)) : doc.querySelector(selector);
}
/** Avoid redundant native mutations without caching ownership or user drafts. */
export function setNodeText(node, value) {
  const text = value == null ? '' : String(value);
  if (node.textContent !== text) node.textContent = text;
}
export function setNodeDisabled(node, value) {
  const disabled = !!value;
  if (node.disabled !== disabled) node.disabled = disabled;
}
