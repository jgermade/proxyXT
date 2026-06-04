# ProxyXT

Extension WebExtension para gestionar varios servidores proxy desde un popup ligero, con cambio rapido, logs de backend y preferencias de comportamiento.

## Caracteristicas

- Alta, edicion y eliminacion de servidores proxy.
- Activacion y desactivacion rapida del servidor activo.
- Failover automatico round-robin ante errores de proxy.
- Recarga opcional de la pestana activa al activar o desactivar un servidor.
- Sincronizacion opcional de servidores con la cuenta del navegador mediante `storage.sync`.
- Logs internos del backend accesibles desde el popup.
- Interfaz multilenguaje con soporte para en, es, fr, pt, it y de.
- Deteccion automatica de idioma del navegador.

## Stack

- Preact
- esbuild
- js-yaml
- WebExtensions API

## Requisitos

- Node.js 18 o superior recomendado.
- Un navegador compatible con WebExtensions.

## Instalacion

```bash
npm install
```

## Desarrollo y build

Genera la extension empaquetada en la carpeta `dist`:

```bash
npm run build
```

## Cargar la extension

### Chrome / Chromium

1. Abre `chrome://extensions`.
2. Activa el modo desarrollador.
3. Pulsa en Load unpacked.
4. Selecciona la carpeta `dist`.

### Firefox

1. Abre `about:debugging#/runtime/this-firefox`.
2. Pulsa en Load Temporary Add-on....
3. Selecciona el archivo `manifest.json` dentro de `dist`.

## Permisos usados

- `storage`: persistencia local y sincronizacion opcional.
- `proxy`: aplicacion de configuracion proxy del navegador.
- `tabs`: recarga opcional de la pestana activa tras activar o desactivar proxy.

## Estructura

```text
messages/    Diccionarios YAML de traduccion
scripts/     Build con esbuild
src/         Popup, background, manifest y recursos fuente
dist/        Extension generada lista para cargar en el navegador
```

## Preferencias disponibles

- Idioma manual o automatico.
- Failover automatico round-robin.
- Recargar pestana activa al cambiar el estado del proxy.
- Sincronizar servidores con la cuenta del navegador.

## Notas

- Si no hay servidor activo, la extension deja el navegador en modo sistema.
- La sincronizacion depende de que el navegador soporte `storage.sync` y de la sesion del usuario.
- Los logs del backend ayudan a diagnosticar errores de aplicacion del proxy o de sincronizacion.