/**
 * tracking.js — Delivery tracking with Google Maps API
 * Replace YOUR_GOOGLE_MAPS_API_KEY with an actual key for live maps.
 */

const ORDER_STAGES = [
  { label: 'Order Placed',   icon: '📋', key: 'processing' },
  { label: 'Confirmed',      icon: '✅', key: 'confirmed'  },
  { label: 'Packed',         icon: '📦', key: 'packed'     },
  { label: 'Shipped',        icon: '🚚', key: 'shipped'    },
  { label: 'Out for Delivery',icon:'🏍️', key: 'out'        },
  { label: 'Delivered',      icon: '🏠', key: 'delivered'  },
];

// Stage progression mapping
const STAGE_MAP = {
  processing: 0, shipped: 3, delivered: 5, cancelled: -1
};

// Sample delivery coordinates (lat, lng) for demo orders
const DEMO_LOCATIONS = {
  'ORD-1001': { lat: 12.9716, lng: 77.5946, city: 'Bangalore' },
  'ORD-1002': { lat: 13.0827, lng: 80.2707, city: 'Chennai'   },
  'ORD-1003': { lat: 19.0760, lng: 72.8777, city: 'Mumbai'    },
};

let mapInstance = null;
let mapMarker   = null;

function trackOrder() {
  const uid = document.getElementById('track-order-id').value.trim().toUpperCase();
  if (!uid) {
    showToast('Input Required', 'Please enter an Order ID', 'warning');
    return;
  }

  const order = DB.getOrderByUid(uid);
  if (!order) {
    showToast('Not Found', `No order found with ID ${uid}`, 'error');
    return;
  }

  // Show result
  document.getElementById('tracking-result').style.display = 'block';

  // Order info card
  document.getElementById('order-info-card').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;">
      <div>
        <div style="color:var(--text-muted);font-size:0.78rem;margin-bottom:4px">ORDER ID</div>
        <div style="font-family:var(--font-head);font-size:1.3rem;font-weight:800">${order.order_uid}</div>
        <div style="color:var(--text-muted);font-size:0.85rem;margin-top:4px">${new Date(order.created_at).toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
      </div>
      <div style="text-align:right">
        <div style="color:var(--text-muted);font-size:0.78rem;margin-bottom:4px">CUSTOMER</div>
        <div style="font-weight:600">${order.customer_name}</div>
        <div style="color:var(--text-muted);font-size:0.85rem">${order.items.length} item(s)</div>
      </div>
      <div style="text-align:right">
        <div style="color:var(--text-muted);font-size:0.78rem;margin-bottom:4px">TOTAL</div>
        <div style="font-family:var(--font-head);font-size:1.2rem;font-weight:700;color:var(--accent)">₹${order.total.toLocaleString('en-IN')}</div>
        <span class="status-pill status-${order.status}">${order.status}</span>
      </div>
    </div>
    <div style="margin-top:16px;border-top:1px solid var(--border);padding-top:14px">
      <div style="color:var(--text-muted);font-size:0.78rem;margin-bottom:8px">ITEMS</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        ${order.items.map(i => `<span style="background:var(--surface2);border:1px solid var(--border);padding:4px 12px;border-radius:50px;font-size:0.8rem">${i.name} ×${i.qty}</span>`).join('')}
      </div>
    </div>
  `;

  // Tracking steps
  const stageIdx = STAGE_MAP[order.status] ?? 0;
  document.getElementById('tracking-steps').innerHTML = ORDER_STAGES.map((s, i) => `
    <div class="step ${i <= stageIdx ? (i < stageIdx ? 'completed' : 'active') : ''}">
      <div class="step-icon">${i < stageIdx ? '✓' : s.icon}</div>
      <div class="step-label">${s.label}</div>
    </div>
  `).join('');

  // Map
  loadMap(uid, order);
}

function loadMap(uid, order) {
  const mapEl = document.getElementById('map');
  const loc   = DEMO_LOCATIONS[uid];

  // Try to load Google Maps if API key provided
const GMAPS_KEY = 'AIzaSyB8TxFu8b4FNsFF4kgFUd8gYEagIKTG5M8';

  if (GMAPS_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY' && typeof google === 'undefined') {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&callback=initGoogleMap`;
    script.async = true;
    window._pendingMapData = { uid, order };
    document.head.appendChild(script);
    return;
  }

  if (typeof google !== 'undefined' && loc) {
    initGoogleMap(loc);
    return;
  }

  // Fallback: custom canvas map
  renderFallbackMap(mapEl, loc, order);
}

window.initGoogleMap = function(locOverride) {
  const loc  = locOverride || (window._pendingMapData && DEMO_LOCATIONS[window._pendingMapData.uid]);
  if (!loc) return;
  const mapEl = document.getElementById('map');

  mapInstance = new google.maps.Map(mapEl, {
    center: loc, zoom: 13,
    styles: DARK_MAP_STYLE,
  });
  mapMarker = new google.maps.Marker({
    position: loc,
    map: mapInstance,
    title: 'Delivery Location',
    icon: {
      url: 'data:image/svg+xml,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="#7c5cfc" stroke="white" stroke-width="3"/>
          <text x="20" y="25" text-anchor="middle" fill="white" font-size="16">📦</text>
        </svg>`),
      scaledSize: typeof google !== 'undefined' ? new google.maps.Size(40, 40) : null,
    }
  });
};

function renderFallbackMap(mapEl, loc, order) {
  const city = loc ? loc.city : 'Unknown Location';
  const status = order.status;

  // Build a rich SVG canvas map placeholder
  mapEl.innerHTML = `
    <div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;
                background:linear-gradient(135deg,#12121a,#1a1a26);padding:24px;text-align:center;position:relative;overflow:hidden">

      <!-- Grid lines -->
      <svg style="position:absolute;inset:0;width:100%;height:100%;opacity:0.06" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#7c5cfc" stroke-width="1"/>
        </pattern></defs>
        <rect width="100%" height="100%" fill="url(#grid)"/>
        <!-- Roads -->
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#252535" stroke-width="8"/>
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#252535" stroke-width="8"/>
        <line x1="25%" y1="0" x2="75%" y2="100%" stroke="#1e1e2e" stroke-width="4"/>
        <circle cx="50%" cy="45%" r="12" fill="#7c5cfc" opacity="0.9"/>
        <circle cx="50%" cy="45%" r="24" fill="#7c5cfc" opacity="0.2"/>
        <circle cx="50%" cy="45%" r="40" fill="#7c5cfc" opacity="0.08"/>
        <text x="50%" y="47%" text-anchor="middle" dominant-baseline="middle" font-size="14" fill="white">📦</text>
      </svg>

      <div style="position:relative;z-index:1">
        <div style="font-size:2.5rem;margin-bottom:12px">🗺️</div>
        <div style="font-family:var(--font-head);font-size:1.2rem;font-weight:700;margin-bottom:6px">
          Delivery tracking — ${city}
        </div>
        <div style="color:var(--text-muted);font-size:0.85rem;margin-bottom:16px">
          Status: <strong style="color:var(--accent)">${status.toUpperCase()}</strong>
        </div>
        <div style="background:rgba(124,92,252,0.1);border:1px solid rgba(124,92,252,0.3);
                    border-radius:10px;padding:12px 20px;font-size:0.8rem;color:var(--text-muted)">
          🔑 Add your Google Maps API key in <code style="color:var(--accent)">js/tracking.js</code>
          to enable live interactive maps
        </div>
      </div>
    </div>`;
}

// Google Maps dark style
const DARK_MAP_STYLE = [
  { elementType:'geometry', stylers:[{color:'#1d2c4d'}] },
  { elementType:'labels.text.fill', stylers:[{color:'#8ec3b9'}] },
  { elementType:'labels.text.stroke', stylers:[{color:'#1a3646'}] },
  { featureType:'road', elementType:'geometry', stylers:[{color:'#304a7d'}] },
  { featureType:'road', elementType:'geometry.stroke', stylers:[{color:'#255763'}] },
  { featureType:'water', elementType:'geometry', stylers:[{color:'#0e1626'}] },
  { featureType:'poi', elementType:'geometry', stylers:[{color:'#283d6a'}] },
];
