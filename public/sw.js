// Service Worker pour SamaDepense PWA
const CACHE_NAME = 'sama-depense-v1'
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
]

// Installation du service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache ouvert')
        return cache.addAll(urlsToCache)
      })
  )
})

// Activation du service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression du cache obsolète:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retourner la ressource du cache si elle existe
        if (response) {
          return response
        }
        
        // Sinon, faire la requête réseau
        return fetch(event.request).then((response) => {
          // Vérifier si la réponse est valide
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }
          
          // Cloner la réponse
          const responseToCache = response.clone()
          
          // Ajouter au cache
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache)
            })
          
          return response
        }).catch(() => {
          // En cas d'erreur réseau, retourner une page hors ligne
          if (event.request.destination === 'document') {
            return caches.match('/')
          }
        })
      })
  )
})

// Gestion des messages du client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  try {
    // Ici, vous pouvez synchroniser les données avec le serveur
    console.log('Synchronisation en arrière-plan')
    
    // Exemple : synchroniser les transactions en attente
    const pendingTransactions = await getPendingTransactions()
    if (pendingTransactions.length > 0) {
      await syncTransactions(pendingTransactions)
    }
  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error)
  }
}

async function getPendingTransactions() {
  // Récupérer les transactions en attente depuis IndexedDB
  return []
}

async function syncTransactions(transactions) {
  // Synchroniser les transactions avec le serveur
  console.log('Synchronisation des transactions:', transactions)
}

// Notifications push
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nouvelle notification SamaDepense',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Voir',
        icon: '/pwa-192x192.png'
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/pwa-192x192.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('SamaDepense', options)
  )
})

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

