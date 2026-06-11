import { StorageService } from "./services/storage.service.js";
import { IconsService } from "./services/icons.service.js";
import { NotificationsService } from "./services/notifications.service.js";
import { ListenersService } from "./services/listeners.service.js";

const api = globalThis.browser ?? globalThis.chrome;

// Instantiate services with dependency injection
const storageService = new StorageService(api);
const iconsService = new IconsService(api, (level, message, context) => storageService.addLog(level, message, context));
const notificationsService = new NotificationsService(api, (level, message, context) => storageService.addLog(level, message, context));
const listenersService = new ListenersService(api, storageService, iconsService, notificationsService);

// Register all event listeners
listenersService.registerAll();