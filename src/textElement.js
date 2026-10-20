/** Native presentation primitive. Document lookup happens at call time so
 * importing a controller never acquires a DOM or another platform service. */
export function textElement(tag, text, className = '', doc = document) {
  const element = doc.createElement(tag);
  element.textContent = text;
  element.className = className;
  return element;
}
