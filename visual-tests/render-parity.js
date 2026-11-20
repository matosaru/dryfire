/** Capture stable text and layout facts shared by native and React page renderers. */
export async function captureRenderParity(page, rootSelector, selectors) {
  return page.locator(rootSelector).evaluate((root, landmarks) => {
    const rect = element => {
      const bounds = element.getBoundingClientRect();
      return ['x', 'y', 'width', 'height'].map(key => Math.round(bounds[key] * 100) / 100);
    };
    return {
      text: root.innerText,
      dimensions: [root.scrollWidth, root.scrollHeight],
      landmarks: landmarks.map(selector => {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`Missing render parity landmark: ${selector}`);
        const style = getComputedStyle(element);
        return {
          selector,
          rect: rect(element),
          font: [style.fontFamily, style.fontSize, style.fontWeight, style.lineHeight],
          color: style.color,
          backgroundColor: style.backgroundColor,
        };
      }),
    };
  }, selectors);
}
