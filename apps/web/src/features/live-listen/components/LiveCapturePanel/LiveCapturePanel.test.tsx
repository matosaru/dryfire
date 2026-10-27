/** @jest-environment jsdom */
import '@dryfire/testing/setup';import{cleanup,render,screen}from'@testing-library/react';import{LiveCapturePanel}from'./LiveCapturePanel.tsx';
afterEach(cleanup);
test('successive timeline updates keep the live region and controls mounted',()=>{
 const {rerender}=render(<LiveCapturePanel state={{timeline:[{name:'First',detail:'0.5 s'}]}}/>);const list=document.getElementById('sessionTimeline'),button=document.getElementById('listenBtn');
 rerender(<LiveCapturePanel state={{timeline:[{name:'Second',detail:'0.4 s'},{name:'First',detail:'0.5 s'}]}}/>);
 expect(document.getElementById('sessionTimeline')).toBe(list);expect(list).toHaveAttribute('aria-live','polite');expect(document.getElementById('listenBtn')).toBe(button);expect(screen.getAllByRole('listitem').map(row=>row.textContent)).toEqual(['Second0.4 s','First0.5 s']);
});
