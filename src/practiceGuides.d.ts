/** Narrow navigation port; the manual/controller APIs remain JavaScript until
 * their own migration stage. This declaration adds no runtime dependency. */
export function isGuideContextCurrent(
  guide: { gunId: string | number; sourceKey: string } | null | undefined,
  gunId: string | number,
  sourceKey?: string | null,
): boolean;

export function isPublicGuideContextCurrent(guide: {gunId:string|number;sourceKey:string;id?:string;publicEntry?:boolean}|null|undefined,gunId:string|number|null|undefined):boolean;
