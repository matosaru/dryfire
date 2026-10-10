/**
 * Reusable, stateless DOM factories for learning cards and drill presets.
 * Callbacks and state are injected by the controller; no storage or audio side effects.
 */
function textNode(doc, tag, className, text) {
  const element = doc.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}
export function actionButton({ label, className = 'button primary', disabled = false, ariaLabel, onClick }, doc = document) {
  const button = textNode(doc, 'button', className, label);
  button.type = 'button';
  button.disabled = disabled;
  if (ariaLabel) button.setAttribute('aria-label', ariaLabel);
  button.addEventListener('click', onClick);
  return button;
}
export function soundCard({
  label, meta, count, maxExamples, minExamples, recommendedExamples, locked,
  onRecord, onReset
}, doc = document) {
  const card = doc.createElement('article');
  card.className = `class-card tone-${meta.tone}`;

  const preview = doc.createElement('div');
  preview.className = 'class-preview';
  const animation = doc.createElement('img');
  animation.src = `/motions/${label}.svg`;
  animation.alt = `Illustrative sound preview for ${meta.title}`;
  animation.width = 240;
  animation.height = 140;
  animation.loading = 'lazy';
  const picture = doc.createElement('picture');
  const animatedSource = doc.createElement('source');
  animatedSource.srcset = `/motions/${label}.gif`;
  animatedSource.media = '(prefers-reduced-motion: no-preference)';
  picture.append(animatedSource, animation);
  preview.append(picture);

  const info = doc.createElement('div');
  info.className = 'class-info';
  info.append(textNode(doc, 'h3', '', meta.title), textNode(doc, 'p', '', meta.description));
  const top = doc.createElement('div');
  top.className = 'class-card-top';
  top.append(preview, info);

  const summary = count >= recommendedExamples
    ? 'recommended amount reached'
    : count >= minExamples ? 'ready to recognize'
      : `${Math.max(0, minExamples - count)} to minimum`;
  const progress = textNode(doc, 'p', 'progress-label', `${count} samples · ${summary}`);
  const bar = doc.createElement('div');
  bar.className = 'progress-track';
  const fill = doc.createElement('span');
  fill.style.width = `${Math.min(100, (count / recommendedExamples) * 100)}%`;
  bar.append(fill);

  const actions = doc.createElement('div');
  actions.className = 'class-actions';
  actions.append(
    actionButton({
      label: count >= maxExamples ? 'Sample limit reached' : '▶ Train',
      className: 'button primary record-example',
      disabled: locked || count >= maxExamples,
      ariaLabel: `Record ${meta.title} sample`,
      onClick: onRecord
    }, doc),
    actionButton({
      label: 'Reset',
      className: 'button secondary reset-class',
      disabled: locked || count === 0,
      ariaLabel: `Reset learned ${meta.title} sounds`,
      onClick: onReset
    }, doc)
  );
  info.append(progress, bar, actions);
  card.append(top);
  return card;
}
export function drillCard({ drill, index, titleFor, onChoose }, doc = document) {
  const card = doc.createElement('article');
  card.className = 'preset-card';
  const heading = textNode(doc, 'h3', '', drill.title);
  const steps = doc.createElement('div');
  steps.className = 'preset-steps';
  drill.steps.forEach((label, position) => {
    if (position) {
      const arrow = textNode(doc, 'span', '', '→');
      arrow.setAttribute('aria-hidden', 'true');
      steps.append(arrow);
    }
    const chip = textNode(doc, 'span', 'preset-chip', titleFor(label));
    chip.setAttribute('data-sound', label);
    steps.append(chip);
  });
  const icon = textNode(doc, 'span', 'drill-target', '◎');
  const header = doc.createElement('div');
  header.className = 'preset-header';
  header.append(icon, heading);
  card.append(header, textNode(doc, 'p', 'drill-description', drill.steps.length === 1 ? 'Practice single-sound recognition.' : `${drill.steps.length}-action sound sequence.`), steps, actionButton({label:'▶ Start Drill',onClick:onChoose},doc));
  return card;
}
