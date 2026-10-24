function renderEvaluation(events) {
  const stats = evaluateEvents(events);
  $('#verifiedCount').textContent = stats.verified;
  $('#accuracyPct').textContent = stats.accuracy === null ? '—' : `${Math.round(stats.accuracy * 100)}%`;
  $('#falsePositivePct').textContent = stats.otherFalsePositiveRate === null ? '—' : `${Math.round(stats.otherFalsePositiveRate * 100)}%`;
  const host = $('#confusionTable');
  host.replaceChildren();
  if (!stats.verified) {
    const p = document.createElement('p');
    p.className = 'muted small';
    p.textContent = 'Verify at least one event below to see the confusion matrix.';
    host.append(p);
    return;
  }
  const table = document.createElement('table');
  const caption = document.createElement('caption');
  caption.textContent = 'Actual sound by predicted label (counts)';
  table.append(caption);
  const head = document.createElement('tr');
  for (const name of ['Actual ↓ / Predicted →', ...PREDICTED_CLASSES]) {
    const th = document.createElement('th');
    th.scope = 'col'; th.textContent = name; head.append(th);
  }
  const thead = document.createElement('thead'); thead.append(head); table.append(thead);
  const tbody = document.createElement('tbody');
  for (const actual of ACTUAL_CLASSES) {
    const tr = document.createElement('tr');
    const th = document.createElement('th'); th.scope = 'row'; th.textContent = actual;
    tr.append(th);
    for (const predicted of PREDICTED_CLASSES) {
      const td = document.createElement('td');
      td.textContent = stats.matrix[actual][predicted];
      if (predicted === actual || (actual === 'other' && predicted === 'unknown')) td.className = 'correct';
      tr.append(td);
    }
    tbody.append(tr);
  }
  table.append(tbody);
  host.append(table);
}

async function renderHistory() {
  const token = ++historyRenderToken;
  const gunId = activeGun?.id;
  const isCurrent = () => token === historyRenderToken && gunId === activeGun?.id;
  const rows = gunId ? await getEvents(gunId) : [];
  if (!isCurrent()) return;
  const sessions = await sessionController.renderSavedSessions(gunId, isCurrent);
  if (!isCurrent()) return;
  if (CAPABILITIES.advancedGraphs) progressView?.render(sessions || [], gunId);
  else $('#progressContent').replaceChildren();
  renderEvaluation(rows);
  if(homePage)homePage.update({events:rows.length}); else $('#homeEvents').textContent = String(rows.length);
  const host = $('#historyList');
  host.replaceChildren();
  if (!rows.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No recognition events yet.';
    host.append(empty);
    return;
  }
  for (const row of rows) {
    const item = document.createElement('article');
    item.className = 'history-item';
    const copy = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = titleFor(row.label);
    const date = document.createElement('p');
    date.textContent = new Date(row.createdAt).toLocaleString();
    const score = document.createElement('span');
    const value = Number.isFinite(row.score) ? row.score : Math.round((row.confidence || 0) * 100);
    score.textContent = `${Math.round(value)}/100`;
    const historicalDrillTitle = row.drillTitle || currentDrill(row.drillId)?.title;
    if (row.drillId && historicalDrillTitle) {
      const drillDescription = document.createElement('p');
      drillDescription.textContent = `${historicalDrillTitle} · ${row.drillCompleted ? 'Sequence recognized ✓' : row.drillOutcome === 'incorrect' ? 'Out of order' : row.drillOutcome === 'unknown' ? 'Unknown sound' : 'Step detected'}`;
      copy.append(drillDescription);
    }
    copy.append(title, date);
    const controls = document.createElement('div');
    controls.className = 'history-controls';
    const actualLabel = document.createElement('label');
    actualLabel.textContent = 'Actual:';
    const actual = document.createElement('select');
    actual.setAttribute('aria-label', `Actual sound for ${new Date(row.createdAt).toLocaleString()}`);
    for (const [value, label] of [['', 'Not verified'], ...labels.map(key => [key, titleFor(key)]), ['other', 'Other / noise']]) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      actual.append(option);
    }
    actual.value = row.actualLabel ?? '';
    actual.addEventListener('change', async () => {
      try { await verifyEvent(row.id, actual.value || null, gunId); await renderHistory(); }
      catch (error) { showError(error); }
    });
    controls.append(actualLabel, actual, score);
    item.append(copy, controls);
    host.append(item);
  }
}

