function renderDistances(distances) {
  const host = $('#distanceBars');
  host.replaceChildren();
  const finite = Object.values(distances).filter(Number.isFinite);
  const max = Math.max(...finite, 1);
  for (const label of labels) {
    const distance = distances[label];
    const row = document.createElement('div');
    row.className = 'distance-row';
    const line = document.createElement('div');
    line.className = 'distance-label';
    const name = document.createElement('span');
    name.textContent = titleFor(label);
    const value = document.createElement('span');
    value.textContent = Number.isFinite(distance) ? distance.toFixed(2) : 'not learned';
    const bar = document.createElement('div');
    bar.className = 'bar';
    const fill = document.createElement('span');
    const similarity = Number.isFinite(distance) ? Math.max(0, 100 - distance / max * 85) : 0;
    fill.style.width = `${similarity}%`;
    bar.append(fill);
    line.append(name, value);
    row.append(line, bar);
    host.append(row);
  }
}

function renderDrill() {
  const drill = currentDrill($('#drillSelect').value);
  const steps = $('#drillSteps');
  steps.replaceChildren();
  $('#drillStats').classList.toggle('hidden', !drill);
  $('#resetDrillBtn').classList.toggle('hidden', !drill);
  if (!drill) {
    $('#drillProgressBadge').textContent = 'Free listen';
    $('#drill-heading').textContent = 'Free listening';
    $('#drillExplanation').textContent = 'Select a preset to track its ordered sound detections while the microphone stays active.';
    $('#drillFeedback').textContent = '';
    return;
  }
  const state = drillState;
  $('#drill-heading').textContent = 'Drill Session';
  $('#drillProgressBadge').textContent = `Step ${(state?.stepIndex ?? 0) + 1} / ${drill.steps.length}`;
  $('#drillExplanation').textContent = 'Detect the ordered sound sequence below. Counts reflect acoustic recognition, not verified physical actions.';
  $('#drillCompleted').textContent = String(state?.completed ?? 0);
  $('#drillIncorrect').textContent = String(state?.incorrect ?? 0);
  $('#drillUnknown').textContent = String(state?.unknown ?? 0);
  for (const [index, label] of drill.steps.entries()) {
    const item = document.createElement('li');
    if (index < (state?.stepIndex ?? 0)) item.className = 'drill-step done';
    else if (index === (state?.stepIndex ?? 0)) item.className = 'drill-step current';
    else item.className = 'drill-step';
    const number = document.createElement('span');
    number.className = 'step-number';
    number.textContent = index < (state?.stepIndex ?? 0) ? '✓' : String(index + 1);
    const name = document.createElement('span');
    name.textContent = titleFor(label);
    item.append(number, name);
    steps.append(item);
  }
  const outcomes = {
    ready: `Ready · awaiting ${titleFor(drill.steps[0])}.`,
    matched: `Recognized · next: ${titleFor(drill.steps[state.stepIndex])}.`,
    completed: `Sequence recognized (${state.completed} completed). Listening for the next attempt.`,
    incorrect: `Unexpected action · restarted. Awaiting ${titleFor(drill.steps[state.stepIndex])}.`,
    unknown: `Unknown sound · keep listening for ${titleFor(drill.steps[state.stepIndex])}.`,
  };
  $('#drillFeedback').textContent = outcomes[state?.lastOutcome ?? 'ready'];
}

