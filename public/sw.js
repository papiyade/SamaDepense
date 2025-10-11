// Service Worker pour SamaDepense PWA
const CACHE_NAME = 'samadepense-v1.0.0'
const STATIC_CACHE = 'samadepense-static-v1.0.0'
const DYNAMIC_CACHE = 'samadepense-dynamic-v1.0.0'

// Ressources à mettre en cache immédiatement
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html'
]

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installation...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Cache statique ouvert')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('[SW] Ressources statiques mises en cache')
        return self.skipWaiting()
      })
  )
})

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Suppression ancien cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('[SW] Service Worker activé')
        return self.clients.claim()
      })
  )
})

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Stratégie Cache First pour les ressources statiques
  if (request.destination === 'document' || 
      request.destination === 'script' || 
      request.destination === 'style' ||
      request.destination === 'image') {
    
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          
          return fetch(request)
            .then((response) => {
              // Ne pas mettre en cache les réponses d'erreur
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response
              }
              
              const responseToCache = response.clone()
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(request, responseToCache)
                })
              
              return response
            })
            .catch(() => {
              // Fallback pour les pages
              if (request.destination === 'document') {
                return caches.match('/offline.html')
              }
            })
        })
    )
  }
  
  // Stratégie Network First pour les API
  else if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseToCache = response.clone()
          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              cache.put(request, responseToCache)
            })
          return response
        })
        .catch(() => {
          return caches.match(request)
        })
    )
  }
})

// Gestion des messages du client
self.addEventListener('message', (event) => {
  const { type, data } = event.data
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break
      
    case 'SYNC_DATA':
      console.log('[SW] Synchronisation des données demandée')
      // Logique de synchronisation ici
      break
      
    case 'CLEAR_CACHE':
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        )
      }).then(() => {
        event.ports[0]?.postMessage({ success: true })
      })
      break
      
    default:
      console.log('[SW] Message non reconnu:', type)
  }
})

// Background Sync
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Synchroniser les données en attente
      syncPendingData()
    )
  }
})

// Notifications Push
self.addEventListener('push', (event) => {
  console.log('[SW] Push reçu:', event)
  
  const options = {
    body: event.data ? event.data.text() : 'Nouvelle notification SamaDepense',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ouvrir l\'app',
        icon: '/icons/action-explore.png'
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/icons/action-close.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('SamaDepense', options)
  )
})

// Clic sur notification
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Clic notification:', event)
  
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Fonction de synchronisation des données
async function syncPendingData() {
  try {
    console.log('[SW] Synchronisation des données en cours...')
    
    // Ici, vous pouvez implémenter la logique de synchronisation
    // Par exemple, envoyer les transactions en attente vers un serveur
    
    // Simuler une synchronisation
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('[SW] Synchronisation terminée')
    return Promise.resolve()
  } catch (error) {
    console.error('[SW] Erreur lors de la synchronisation:', error)
    return Promise.reject(error)
  }
}

