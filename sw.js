const CACHE_NAME = 'tractor-scheduler-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// تثبيت Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('تم فتح الكاش:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('حذف الكاش القديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// الاستجابة للطلبات
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        // استنساخ الطلب لأنه قابل للاستهلاك مرة واحدة فقط
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // التحقق من أن الاستجابة صالحة
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // استنساخ الاستجابة لأنها قابلة للاستهلاك مرة واحدة فقط
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
      .catch(() => {
        // في حالة عدم الاتصال، يمكن عرض رسالة مناسبة
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
}); 
