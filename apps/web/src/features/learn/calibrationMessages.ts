import {formatLocaleNumber,translate} from '../../localization/runtime.ts';
import type {CalibrationCatalogMessages,CalibrationKind} from '@dryfire/ui/CalibrationCatalog';

const categoryKeys:Record<CalibrationKind,string>={reset:'reset',noise:'noise',cue:'cue'};

export function createCalibrationCatalogMessages():CalibrationCatalogMessages{
 const categories=Object.fromEntries(Object.entries(categoryKeys).map(([kind,key])=>[
  kind,
  {title:translate('learn',`calibration.examples.${key}.title`),description:translate('learn',`calibration.examples.${key}.description`)},
 ])) as CalibrationCatalogMessages['categories'];
 return{
  categories,
  train:translate('learn','calibration.train'),
  reset:translate('learn','calibration.reset'),
  progress:(description,count,maximum)=>translate('learn','calibration.progress',{description,count:formatLocaleNumber(count),maximum:formatLocaleNumber(maximum)}),
  limitReached:translate('learn','calibration.limitReached'),
 };
}

export function calibrationProgressMessage(kind:CalibrationKind,count:number,maximum:number){
 const messages=createCalibrationCatalogMessages();
 return `${messages.progress(messages.categories[kind].description,count,maximum)}${count>=maximum?messages.limitReached:''}`;
}
