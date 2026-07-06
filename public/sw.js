// Service Worker de Convoca — escucha los mensajes push del servidor.
// Cuando el backend envía una notificación, el navegador despierta este archivo
// y muestra la alerta nativa del sistema operativo.

self.addEventListener('push', (event) => {
  let datos = { title: 'Convoca', body: 'Tenés una novedad en Convoca', url: '/' };

  if (event.data) {
    try {
      datos = { ...datos, ...event.data.json() };
    } catch (_err) {
      datos.body = event.data.text();
    }
  }

  const opciones = {
    body: datos.body,
    icon: '/favicon.png',
    badge: '/favicon.png',
    data: { url: datos.url || '/' },
  };

  event.waitUntil(self.registration.showNotification(datos.title, opciones));
});

// Si el usuario hace clic en la notificación, abrimos la app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const destino = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((lista) => {
      for (const client of lista) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(destino);
      }
      return undefined;
    })
  );
});
