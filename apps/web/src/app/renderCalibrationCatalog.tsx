import { renderToStaticMarkup } from 'react-dom/server';
import { CalibrationCatalog } from '@dryfire/ui/CalibrationCatalog';
import {createCalibrationCatalogMessages} from '../features/learn/calibrationMessages.ts';
export const renderCalibrationCatalog = () => renderToStaticMarkup(<CalibrationCatalog messages={createCalibrationCatalogMessages()} />);
