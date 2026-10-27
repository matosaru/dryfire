/** Revalidate worker code on app entry; normal activation preserves open sessions. */
export function registerReleaseWorker({serviceWorker,onError}) {
  return serviceWorker.register('/sw.js',{updateViaCache:'none'}).catch(onError);
}
