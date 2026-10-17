import { renderToStaticMarkup } from 'react-dom/server';
import { CalibrationCatalog } from '@dryfire/ui/CalibrationCatalog';
export const renderCalibrationCatalog = () => renderToStaticMarkup(<CalibrationCatalog />);
