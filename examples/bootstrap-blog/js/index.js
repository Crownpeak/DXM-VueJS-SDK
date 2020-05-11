import Routing from "./routing";
import { CmsCore } from 'crownpeak-dxm-vuejs-sdk';

CmsCore.init(process.env.CMS_STATIC_CONTENT_LOCATION, process.env.CMS_DYNAMIC_CONTENT_LOCATION);
Routing.processRoutes();