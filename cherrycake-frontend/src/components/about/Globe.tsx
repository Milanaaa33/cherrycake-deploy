import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { setLanguageFromRegion, setRegion } from '../../store';
import countryBoundaries from '../../data/countryBoundaries.json';
import { getFlagSrc } from '../../i18n/languages';
import { useTranslation } from '../../i18n/useTranslation';
import './Globe.css';

export type Hub = {
  code: string;
  country: string;
  flag: string;
  city: string;
  title: string;
  address: string;
  currency: string;
  specialty: string;
  lat: number;
  lng: number;
  color: string;
  hours: string;
};

type Ring = number[][];
type Projected = { x: number; y: number; visible: boolean };
type PresetKey = 'central-asia' | 'caucasus' | 'anatolia' | 'nordics' | 'china' | 'global';

const BOUNDARIES: Record<string, unknown> = countryBoundaries;

export const HUBS: Hub[] = [
  {
    code: 'UZB',
    country: 'Uzbekistan',
    flag: '🇺🇿',
    city: 'Tashkent',
    title: 'Central Flagship Pâtisserie',
    address: '14 Sakura Boulevard, Central District',
    currency: 'UZS (so\'m)',
    specialty: 'Cherry Blossom Heart Gateau & Navruz Honey Tart',
    lat: 41.2995,
    lng: 69.2401,
    color: '#e63960',
    hours: '08:00 – 22:00'
  },
  {
    code: 'KAZ',
    country: 'Kazakhstan',
    flag: '🇰🇿',
    city: 'Almaty',
    title: 'Tien Shan Alpine Boutique Hub',
    address: '88 Dostyk Avenue, Medeu Valley',
    currency: 'KZT (₸)',
    specialty: 'Almaty Golden Apple & Berry Mille-Feuille',
    lat: 43.2220,
    lng: 76.8512,
    color: '#38c172',
    hours: '08:30 – 22:30'
  },
  {
    code: 'GEO',
    country: 'Georgia',
    flag: '🇬🇪',
    city: 'Tbilisi',
    title: 'Sakura Terrace & Specialty Roastery',
    address: '22 Rustaveli Avenue, Sololaki',
    currency: 'GEL (₾)',
    specialty: 'Saperavi Grape & Dark Chocolate Petite',
    lat: 41.7151,
    lng: 44.8271,
    color: '#e5b061',
    hours: '09:00 – 23:00'
  },
  {
    code: 'AZE',
    country: 'Azerbaijan',
    flag: '🇦🇿',
    city: 'Baku',
    title: 'Caspian Confectionery Salon',
    address: '15 Nizami Street, Fountain Square',
    currency: 'AZN (₼)',
    specialty: 'Saffron Pistachio Baklava Gateau',
    lat: 40.4093,
    lng: 49.8671,
    color: '#38bdf8',
    hours: '09:00 – 22:30'
  },
  {
    code: 'ARM',
    country: 'Armenia',
    flag: '🇦🇲',
    city: 'Yerevan',
    title: 'Ararat Valley Artisan Salon',
    address: '7 Northern Avenue, Kentron',
    currency: 'AMD (֏)',
    specialty: 'Golden Apricot Blossom Cake',
    lat: 40.1792,
    lng: 44.4991,
    color: '#fb923c',
    hours: '08:30 – 22:00'
  },
  {
    code: 'TUR',
    country: 'Turkey',
    flag: '🇹🇷',
    city: 'Istanbul',
    title: 'Bosphorus Pâtisserie & Barista',
    address: '42 Abdi İpekçi Caddesi, Nişantaşı',
    currency: 'TRY (₺)',
    specialty: 'Rose Petal & Belgian Ganache Gateau',
    lat: 41.0082,
    lng: 28.9784,
    color: '#f43f5e',
    hours: '08:00 – 23:00'
  },
  {
    code: 'CHN',
    country: 'China',
    flag: '🇨🇳',
    city: 'Beijing',
    title: 'Imperial Blossom Tea & Gateau Lounge',
    address: '18 Wangfujing Street, Dongcheng',
    currency: 'CNY (¥)',
    specialty: 'Uji Matcha Cherry Blossom Velvet Cake',
    lat: 39.9042,
    lng: 116.4074,
    color: '#f59e0b',
    hours: '09:00 – 22:00'
  },
  {
    code: 'UKR',
    country: 'Ukraine',
    flag: '🇺🇦',
    city: 'Kyiv',
    title: 'Dnieper Artisan Bakery & Café',
    address: '10 Khreshchatyk Street, Pechersk',
    currency: 'UAH (₴)',
    specialty: 'Kyiv Hazelnut Meringue & Berry Gateau',
    lat: 50.4501,
    lng: 30.5234,
    color: '#60a5fa',
    hours: '08:00 – 21:30'
  },
  {
    code: 'ROU',
    country: 'Romania',
    flag: '🇷🇴',
    city: 'Bucharest',
    title: 'Royal Gateau & Viennoiserie Salon',
    address: '34 Calea Victoriei, Sector 1',
    currency: 'RON (lei)',
    specialty: 'Walnut Nougat & Cherry Charlotte',
    lat: 44.4268,
    lng: 26.1025,
    color: '#c084fc',
    hours: '08:30 – 22:00'
  },
  {
    code: 'MDA',
    country: 'Moldova',
    flag: '🇲🇩',
    city: 'Chisinau',
    title: 'Belle Époque Pâtisserie',
    address: '26 Stefan cel Mare Boulevard',
    currency: 'MDL (L)',
    specialty: 'Prune & Red Wine Velvet Mousse',
    lat: 47.0105,
    lng: 28.8638,
    color: '#a78bfa',
    hours: '08:30 – 21:30'
  },
  {
    code: 'BLR',
    country: 'Belarus',
    flag: '🇧🇾',
    city: 'Minsk',
    title: 'Heritage Viennoiserie Boutique',
    address: '12 Nezavisimosti Avenue',
    currency: 'BYN (Br)',
    specialty: 'Wild Cranberry Cream Sponge Cake',
    lat: 53.9045,
    lng: 27.5615,
    color: '#f87171',
    hours: '08:00 – 22:00'
  },
  {
    code: 'RUS',
    country: 'Russia',
    flag: '🇷🇺',
    city: 'Moscow',
    title: 'Northern Sakura Salon & Bakery',
    address: '5 Tverskaya Street, Arbat',
    currency: 'RUB (₽)',
    specialty: 'Smokey Caramel Honey & Sour Cream Tier',
    lat: 55.7558,
    lng: 37.6173,
    color: '#fb7185',
    hours: '08:00 – 23:00'
  },
  {
    code: 'EST',
    country: 'Estonia',
    flag: '🇪🇪',
    city: 'Tallinn',
    title: 'Old Town Pâtisserie Boutique',
    address: '8 Viru Street, Medieval Quarter',
    currency: 'EUR (€)',
    specialty: 'Nordic Cloudberry & Marzipan Heart',
    lat: 59.4370,
    lng: 24.7536,
    color: '#38bdf8',
    hours: '09:00 – 21:00'
  },
  {
    code: 'LVA',
    country: 'Latvia',
    flag: '🇱🇻',
    city: 'Riga',
    title: 'Amber Baltic Confectionery',
    address: '14 Brivibas Boulevard, Centrs',
    currency: 'EUR (€)',
    specialty: 'Black Balsam Currant Mousse Gateau',
    lat: 56.9496,
    lng: 24.1052,
    color: '#e879f9',
    hours: '08:30 – 21:30'
  },
  {
    code: 'LTU',
    country: 'Lithuania',
    flag: '🇱🇹',
    city: 'Vilnius',
    title: 'Grand Duke Pastry Studio',
    address: '19 Gedimino Avenue, Old Town',
    currency: 'EUR (€)',
    specialty: 'Sakura Poppy Seed Chiffon Tier',
    lat: 54.6872,
    lng: 25.2797,
    color: '#34d399',
    hours: '08:30 – 22:00'
  },
  {
    code: 'FIN',
    country: 'Finland',
    flag: '🇫🇮',
    city: 'Helsinki',
    title: 'Nordic Berry & Espresso Salon',
    address: '22 Esplanadi, Kluuvi',
    currency: 'EUR (€)',
    specialty: 'Arctic Lingonberry Cardamom Gateau',
    lat: 60.1699,
    lng: 24.9384,
    color: '#67e8f9',
    hours: '08:00 – 21:00'
  },
  {
    code: 'SWE',
    country: 'Sweden',
    flag: '🇸🇪',
    city: 'Stockholm',
    title: 'Royal Archipelago Pâtisserie',
    address: '11 Strandvägen, Östermalm',
    currency: 'SEK (kr)',
    specialty: 'Princess Cake with Sakura Blossom Cream',
    lat: 59.3293,
    lng: 18.0686,
    color: '#facc15',
    hours: '08:30 – 21:30'
  }
];

const CORRIDOR_CONNECTIONS: [string, string][] = [
  ['UZB', 'KAZ'],
  ['UZB', 'GEO'],
  ['GEO', 'AZE'],
  ['GEO', 'ARM'],
  ['GEO', 'TUR'],
  ['TUR', 'ROU'],
  ['ROU', 'MDA'],
  ['ROU', 'UKR'],
  ['UKR', 'BLR'],
  ['UKR', 'RUS'],
  ['BLR', 'LTU'],
  ['LTU', 'LVA'],
  ['LVA', 'EST'],
  ['EST', 'FIN'],
  ['FIN', 'SWE'],
  ['UZB', 'CHN']
];

export default function Globe() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const currentRegion = useSelector((state: RootState) => state.region.code || 'UZB');
  const mountRef = useRef<HTMLDivElement>(null);

  const [selectedHub, setSelectedHub] = useState<Hub>(HUBS[0]);
  const [hoveredHub, setHoveredHub] = useState<Hub | null>(null);
  const [activePreset, setActivePreset] = useState<PresetKey>('central-asia');
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [projectedPositions, setProjectedPositions] = useState<Record<string, Projected>>({});

  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef({
    targetLat: 42,
    targetLng: 65,
    currentLat: 42,
    currentLng: 65,
    targetDistance: 195,
    currentDistance: 195,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
    autoRotate: true
  });

  const R = 80;

  const latLngToVector3 = (lat: number, lng: number, r: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(r * Math.sin(phi) * Math.cos(theta));
    const z = r * Math.sin(phi) * Math.sin(theta);
    const y = r * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  useEffect(() => {
    const match = HUBS.find((h) => h.code === currentRegion);
    if (match) setSelectedHub(match);
  }, [currentRegion]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 900;
    let height = container.clientHeight || 560;

    // 1. Scene, Camera, High-Fidelity ACESFilmic Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. Photorealistic Realistic Earth Globe
    const textureLoader = new THREE.TextureLoader();
    const dayTexture = textureLoader.load('/assets/earth_day.jpg');
    const nightTexture = textureLoader.load('/assets/earth_night.jpg');
    const bumpTexture = textureLoader.load('/assets/earth_topology.png');

    const earthGeo = new THREE.SphereGeometry(R, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: dayTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.85,
      roughness: 0.65,
      metalness: 0.1,
      emissiveMap: nightTexture,
      emissive: new THREE.Color(0xf59e0b),
      emissiveIntensity: 0.45
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earthMesh);

    // 3. Glowing Atmospheric Shell (Rayleigh scattering additive halo)
    const atmoGeo = new THREE.SphereGeometry(R * 1.018, 64, 64);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0xff8fa3, // Sakura blossom celestial scattering
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    scene.add(atmoMesh);

    // 4. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xfff6ed, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    sunLight.position.set(160, 90, 150);
    scene.add(sunLight);

    // 5. Render Country Solid Fills & Outlines for all 17 Operating Regions
    const countryFillsGroup = new THREE.Group();
    const countryLinesGroup = new THREE.Group();

    // Helper to recursively subdivide flat polygon triangles along the sphere's curvature
    // so the solid country fill follows R*1.003 perfectly and never cuts inside the Earth
    const subdivideSpherical = (
      v0: THREE.Vector3, v1: THREE.Vector3, v2: THREE.Vector3, radius: number, maxEdgeSq = 16, depth = 0,
    ): THREE.Vector3[] => {
      if (depth >= 3) return [v0, v1, v2];
      const d01 = v0.distanceToSquared(v1);
      const d12 = v1.distanceToSquared(v2);
      const d20 = v2.distanceToSquared(v0);
      if (d01 > maxEdgeSq || d12 > maxEdgeSq || d20 > maxEdgeSq) {
        const m01 = v0.clone().add(v1).multiplyScalar(0.5).normalize().multiplyScalar(radius);
        const m12 = v1.clone().add(v2).multiplyScalar(0.5).normalize().multiplyScalar(radius);
        const m20 = v2.clone().add(v0).multiplyScalar(0.5).normalize().multiplyScalar(radius);
        return [
          ...subdivideSpherical(v0, m01, m20, radius, maxEdgeSq, depth + 1),
          ...subdivideSpherical(v1, m12, m01, radius, maxEdgeSq, depth + 1),
          ...subdivideSpherical(v2, m20, m12, radius, maxEdgeSq, depth + 1),
          ...subdivideSpherical(m01, m12, m20, radius, maxEdgeSq, depth + 1)
        ];
      }
      return [v0, v1, v2];
    };

    const drawCountryBoundary = (coordsArray: unknown, colorHex: string) => {
      const lineMat = new THREE.LineBasicMaterial({
        color: colorHex,
        linewidth: 2.5,
        transparent: false,
        opacity: 1.0
      });

      // Country-specific fill with 25% opacity
      const fillMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.25,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1
      });

      const fillRadius = R * 1.003;
      const lineRadius = R * 1.005;

      const processRing = (ring: Ring) => {
        if (!ring || ring.length < 3) return;

        // 1. Boundary Contour Outline Line
        const points: THREE.Vector3[] = [];
        for (const [lng, lat] of ring) {
          points.push(latLngToVector3(lat, lng, lineRadius));
        }
        if (points.length > 2) {
          const geo = new THREE.BufferGeometry().setFromPoints(points);
          const line = new THREE.Line(geo, lineMat);
          countryLinesGroup.add(line);
        }

        // 2. Solid Fill Polygon via Earcut triangulation + Spherical Subdivision
        try {
          const pts2D = ring.map(([lng, lat]) => new THREE.Vector2(lng, lat));
          const faces = THREE.ShapeUtils.triangulateShape(pts2D, []);
          if (faces && faces.length > 0) {
            const v3DList = ring.map(([lng, lat]) => latLngToVector3(lat, lng, fillRadius));
            const positions = [];
            for (const [i0, i1, i2] of faces) {
              const v0 = v3DList[i0];
              const v1 = v3DList[i1];
              const v2 = v3DList[i2];
              if (v0 && v1 && v2) {
                const subVerts = subdivideSpherical(v0, v1, v2, fillRadius, 16, 0);
                for (const v of subVerts) {
                  positions.push(v.x, v.y, v.z);
                }
              }
            }
            if (positions.length > 0) {
              const fillGeo = new THREE.BufferGeometry();
              fillGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
              fillGeo.computeVertexNormals();
              const fillMesh = new THREE.Mesh(fillGeo, fillMat);
              countryFillsGroup.add(fillMesh);
            }
          }
        } catch {
          // Graceful fallback for non-manifold edge rings
        }
      };

      if (Array.isArray(coordsArray)) {
        if (Array.isArray(coordsArray[0][0][0])) {
          (coordsArray as Ring[][]).forEach((poly) => poly.forEach((ring) => processRing(ring)));
        } else if (Array.isArray(coordsArray[0][0])) {
          (coordsArray as Ring[]).forEach((ring) => processRing(ring));
        }
      }
    };

    HUBS.forEach((hub) => {
      const rawCoords = BOUNDARIES[hub.code];
      if (rawCoords) {
        drawCountryBoundary(rawCoords, hub.color);
      }
    });

    scene.add(countryFillsGroup);
    scene.add(countryLinesGroup);

    // 6. Hub Beacons, Rings & Vertical Light Rays
    const hubObjects: { hub: Hub; pos: THREE.Vector3; ringMesh: THREE.Mesh }[] = [];
    const beaconGroup = new THREE.Group();

    HUBS.forEach((hub) => {
      const pos = latLngToVector3(hub.lat, hub.lng, R * 1.002);
      const normal = pos.clone().normalize();

      // Core point
      const dotGeo = new THREE.SphereGeometry(1.1, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const dotMesh = new THREE.Mesh(dotGeo, dotMat);
      dotMesh.position.copy(pos);
      beaconGroup.add(dotMesh);

      // Vertical 3D ray into orbit
      const rayPoints = [pos, pos.clone().add(normal.clone().multiplyScalar(9))];
      const rayGeo = new THREE.BufferGeometry().setFromPoints(rayPoints);
      const rayMat = new THREE.LineBasicMaterial({
        color: hub.color,
        linewidth: 2,
        transparent: true,
        opacity: 0.85
      });
      const rayLine = new THREE.Line(rayGeo, rayMat);
      beaconGroup.add(rayLine);

      // Pulsing 3D Orbit Ring around beacon
      const ringGeo = new THREE.RingGeometry(1.3, 3.0, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: hub.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
        depthWrite: false
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos.clone().add(normal.clone().multiplyScalar(0.2)));
      ringMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      beaconGroup.add(ringMesh);

      hubObjects.push({ hub, pos, ringMesh });
    });

    scene.add(beaconGroup);

    // 7. 3D Supply Logistics Corridor Arcs & Traveling Photons
    const arcCurves = [];
    const arcLinesGroup = new THREE.Group();
    const photons: { mesh: THREE.Mesh; curve: THREE.QuadraticBezierCurve3; offset: number; speed: number }[] = [];

    CORRIDOR_CONNECTIONS.forEach(([fromCode, toCode], index) => {
      const fromHub = HUBS.find((h) => h.code === fromCode);
      const toHub = HUBS.find((h) => h.code === toCode);
      if (!fromHub || !toHub) return;

      const p1 = latLngToVector3(fromHub.lat, fromHub.lng, R * 1.002);
      const p2 = latLngToVector3(toHub.lat, toHub.lng, R * 1.002);

      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const dist = p1.distanceTo(p2);
      const altitude = R * (1.05 + Math.min(0.25, dist / (R * 4)));
      mid.normalize().multiplyScalar(altitude);

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      arcCurves.push(curve);

      const curvePoints = curve.getPoints(45);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const arcMat = new THREE.LineDashedMaterial({
        color: index % 2 === 0 ? 0xe63960 : 0xe5b061,
        dashSize: 2.5,
        gapSize: 1.5,
        linewidth: 1.5,
        transparent: true,
        opacity: 0.65
      });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      arcLine.computeLineDistances();
      arcLinesGroup.add(arcLine);

      // Photon packet
      const photonGeo = new THREE.SphereGeometry(0.9, 12, 12);
      const photonMat = new THREE.MeshBasicMaterial({ color: 0xfff6ed });
      const photonMesh = new THREE.Mesh(photonGeo, photonMat);
      arcLinesGroup.add(photonMesh);
      photons.push({ mesh: photonMesh, curve, speed: 0.12 + (index % 5) * 0.04, offset: (index * 0.17) % 1.0 });
    });

    scene.add(arcLinesGroup);

    // 8. Google 3D Maps style Mouse & Touch Orbit Controls
    const state = controlsRef.current;

    const onMouseDown = (e: MouseEvent) => {
      state.isDragging = true;
      state.autoRotate = false;
      setIsAutoRotating(false);
      state.lastMouseX = e.clientX;
      state.lastMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!state.isDragging) return;
      const deltaX = e.clientX - state.lastMouseX;
      const deltaY = e.clientY - state.lastMouseY;

      state.targetLng -= deltaX * 0.35;
      state.targetLat += deltaY * 0.35;
      state.targetLat = Math.max(-85, Math.min(85, state.targetLat));

      state.lastMouseX = e.clientX;
      state.lastMouseY = e.clientY;
    };

    const onMouseUp = () => {
      state.isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      state.targetDistance += e.deltaY * 0.12;
      state.targetDistance = Math.max(125, Math.min(320, state.targetDistance));
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        state.isDragging = true;
        state.autoRotate = false;
        setIsAutoRotating(false);
        state.lastMouseX = e.touches[0].clientX;
        state.lastMouseY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!state.isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - state.lastMouseX;
      const deltaY = e.touches[0].clientY - state.lastMouseY;

      state.targetLng -= deltaX * 0.45;
      state.targetLat += deltaY * 0.45;
      state.targetLat = Math.max(-85, Math.min(85, state.targetLat));

      state.lastMouseX = e.touches[0].clientX;
      state.lastMouseY = e.touches[0].clientY;
    };

    const onTouchEnd = () => {
      state.isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 9. Animation Loop
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (state.autoRotate) {
        state.targetLng += 0.08;
      }

      state.currentLng += (state.targetLng - state.currentLng) * 0.08;
      state.currentLat += (state.targetLat - state.currentLat) * 0.08;
      state.currentDistance += (state.targetDistance - state.currentDistance) * 0.08;

      const camPos = latLngToVector3(state.currentLat, state.currentLng, state.currentDistance);
      camera.position.copy(camPos);
      camera.lookAt(0, 0, 0);

      // Animate traveling photons
      photons.forEach((p) => {
        const t = (elapsedTime * p.speed + p.offset) % 1.0;
        p.mesh.position.copy(p.curve.getPoint(t));
      });

      // Pulse beacon rings
      const ringScale = 1.0 + Math.sin(elapsedTime * 4) * 0.3;
      hubObjects.forEach((h) => {
        h.ringMesh.scale.set(ringScale, ringScale, 1);
      });

      // Project positions for 2D HTML badges (only for top visible hubs)
      const newProjected: Record<string, Projected> = {};
      const toCam = camera.position.clone().normalize();
      const hw = width / 2;
      const hh = height / 2;

      hubObjects.forEach(({ hub, pos }) => {
        const normal = pos.clone().normalize();
        const dot = toCam.dot(normal);
        if (dot > 0.25) {
          const projected = pos.clone().project(camera);
          newProjected[hub.code] = {
            x: projected.x * hw + hw,
            y: -(projected.y * hh) + hh,
            visible: true
          };
        } else {
          newProjected[hub.code] = { x: 0, y: 0, visible: false };
        }
      });

      setProjectedPositions(newProjected);
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const jumpToHub = (hub: Hub) => {
    setSelectedHub(hub);
    const state = controlsRef.current;
    state.autoRotate = false;
    setIsAutoRotating(false);
    state.targetLat = hub.lat;
    state.targetLng = hub.lng;
    state.targetDistance = 160;
  };

  const setPreset = (presetKey: PresetKey) => {
    setActivePreset(presetKey);
    const state = controlsRef.current;
    state.autoRotate = false;
    setIsAutoRotating(false);

    if (presetKey === 'central-asia') {
      state.targetLat = 42.0;
      state.targetLng = 72.0;
      state.targetDistance = 180;
      setSelectedHub(HUBS.find((h) => h.code === 'UZB') ?? HUBS[0]);
    } else if (presetKey === 'caucasus') {
      state.targetLat = 41.5;
      state.targetLng = 46.0;
      state.targetDistance = 170;
      setSelectedHub(HUBS.find((h) => h.code === 'GEO') ?? HUBS[0]);
    } else if (presetKey === 'anatolia') {
      state.targetLat = 42.0;
      state.targetLng = 31.0;
      state.targetDistance = 180;
      setSelectedHub(HUBS.find((h) => h.code === 'TUR') ?? HUBS[0]);
    } else if (presetKey === 'nordics') {
      state.targetLat = 58.0;
      state.targetLng = 22.0;
      state.targetDistance = 185;
      setSelectedHub(HUBS.find((h) => h.code === 'SWE') ?? HUBS[0]);
    } else if (presetKey === 'china') {
      state.targetLat = 38.0;
      state.targetLng = 114.0;
      state.targetDistance = 180;
      setSelectedHub(HUBS.find((h) => h.code === 'CHN') ?? HUBS[0]);
    } else if (presetKey === 'global') {
      state.targetLat = 45.0;
      state.targetLng = 55.0;
      state.targetDistance = 240;
    }
  };

  const toggleAutoRotate = () => {
    const next = !isAutoRotating;
    setIsAutoRotating(next);
    controlsRef.current.autoRotate = next;
  };

  const handleSelectRegion = (hub: Hub) => {
    dispatch(setRegion(hub.code));
    dispatch(setLanguageFromRegion(hub.code));
    setSelectedHub(hub);
  };

  return (
    <section
      id="global-footprint"
      className="cc-globe"
      style={{
        background: 'linear-gradient(180deg, #180512 0%, #200818 50%, #150310 100%)',
        border: '2px solid var(--cherry-border)',
        borderRadius: '28px',
        padding: '36px 24px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.55)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Atmosphere light blur in top corner */}
      <div
        style={{
          position: 'absolute',
          top: '-80px',
          right: '-80px',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(230, 57, 96, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      {/* Header & Controls Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
          position: 'relative',
          zIndex: 10
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color: 'var(--sakura-pink)',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <img src="/TransparentSakuraFlower.png" alt="Sakura" style={{ width: '15px', height: '15px', objectFit: 'contain' }} />
            <span>{t('about.mapEyebrow', 'Haute Pâtisserie Global Footprint')}</span>
          </span>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '2rem',
              color: 'var(--cheesecake-cream)',
              margin: '6px 0 0 0'
            }}
          >
            {t('about.mapTitle', 'Our International Pâtisserie Footprint')}
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.92rem', margin: '4px 0 0 0', maxWidth: '640px' }}>
            {t('about.mapSubtitle', 'Explore our artisanal bakeries, cold-chain distribution corridors, and single-origin ingredient sourcing spanning 17 countries.')}
          </p>
        </div>

        {/* Quick Camera Presets Toolbar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0, 0, 0, 0.45)',
            padding: '6px 10px',
            borderRadius: '9999px',
            border: '1.5px solid var(--cherry-border)'
          }}
        >
          <button
            type="button"
            onClick={() => setPreset('central-asia')}
            style={{
              background: activePreset === 'central-asia' ? 'var(--raspberry-coulis)' : 'transparent',
              color: activePreset === 'central-asia' ? '#fff' : 'var(--text-dim)',
              border: 'none',
              borderRadius: '9999px',
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <img src={getFlagSrc('uzb')} alt="UZB" style={{ width: '15px', height: '11px', objectFit: 'cover', borderRadius: '2px' }} />
            {t('about.presetCentralAsia', 'Central Asia')}
          </button>
          <button
            type="button"
            onClick={() => setPreset('caucasus')}
            style={{
              background: activePreset === 'caucasus' ? 'var(--raspberry-coulis)' : 'transparent',
              color: activePreset === 'caucasus' ? '#fff' : 'var(--text-dim)',
              border: 'none',
              borderRadius: '9999px',
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <img src={getFlagSrc('geo')} alt="GEO" style={{ width: '15px', height: '11px', objectFit: 'cover', borderRadius: '2px' }} />
            {t('about.presetCaucasus', 'Caucasus')}
          </button>
          <button
            type="button"
            onClick={() => setPreset('anatolia')}
            style={{
              background: activePreset === 'anatolia' ? 'var(--raspberry-coulis)' : 'transparent',
              color: activePreset === 'anatolia' ? '#fff' : 'var(--text-dim)',
              border: 'none',
              borderRadius: '9999px',
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <img src={getFlagSrc('tur')} alt="TUR" style={{ width: '15px', height: '11px', objectFit: 'cover', borderRadius: '2px' }} />
            {t('about.presetAnatolia', 'Anatolia')}
          </button>
          <button
            type="button"
            onClick={() => setPreset('nordics')}
            style={{
              background: activePreset === 'nordics' ? 'var(--raspberry-coulis)' : 'transparent',
              color: activePreset === 'nordics' ? '#fff' : 'var(--text-dim)',
              border: 'none',
              borderRadius: '9999px',
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <img src={getFlagSrc('swe')} alt="SWE" style={{ width: '15px', height: '11px', objectFit: 'cover', borderRadius: '2px' }} />
            {t('about.presetNordics', 'Nordics & Baltics')}
          </button>
          <button
            type="button"
            onClick={() => setPreset('china')}
            style={{
              background: activePreset === 'china' ? 'var(--raspberry-coulis)' : 'transparent',
              color: activePreset === 'china' ? '#fff' : 'var(--text-dim)',
              border: 'none',
              borderRadius: '9999px',
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <img src={getFlagSrc('chn')} alt="CHN" style={{ width: '15px', height: '11px', objectFit: 'cover', borderRadius: '2px' }} />
            {t('about.presetChina', 'China')}
          </button>
          <button
            type="button"
            onClick={() => setPreset('global')}
            style={{
              background: activePreset === 'global' ? 'var(--raspberry-coulis)' : 'transparent',
              color: activePreset === 'global' ? '#fff' : 'var(--text-dim)',
              border: 'none',
              borderRadius: '9999px',
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🌍 {t('about.presetGlobal', 'Global')}
          </button>
          <button
            type="button"
            onClick={toggleAutoRotate}
            title={isAutoRotating ? 'Pause rotation' : 'Resume rotation'}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: isAutoRotating ? 'var(--sakura-pink)' : 'var(--text-dim)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isAutoRotating ? '⏸' : '▶'}
          </button>
        </div>
      </div>

      {/* 3D Earth Globe Canvas Mount Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '520px',
          backgroundColor: '#0c0208',
          borderRadius: '20px',
          border: '1.5px solid var(--cherry-border)',
          overflow: 'hidden',
          boxShadow: 'inset 0 0 80px rgba(0, 0, 0, 0.8)'
        }}
      >
        {/* Three.js Canvas */}
        <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

        {/* Projected 2D Interactive HTML Markers & Callout */}
        {HUBS.map((hub) => {
          const pos = projectedPositions[hub.code];
          if (!pos || !pos.visible) return null;

          const isSelected = selectedHub?.code === hub.code;
          const isHovered = hoveredHub?.code === hub.code;

          // If this hub is selected, render the rich floating callout card!
          if (isSelected) {
            return (
              <div
                key={hub.code}
                onClick={() => jumpToHub(hub)}
                style={{
                  position: 'absolute',
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  transform: 'translate(-50%, -100%) translateY(-14px)',
                  zIndex: 40,
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div
                  style={{
                    background: 'rgba(26, 6, 18, 0.95)',
                    backdropFilter: 'blur(12px)',
                    border: `2px solid ${hub.color}`,
                    borderRadius: '14px',
                    padding: '8px 14px',
                    boxShadow: `0 12px 32px rgba(0, 0, 0, 0.7), 0 0 18px ${hub.color}55`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {/* Glowing orbit around flag in callout card - blurred and transparent at 50% */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: '-5px',
                        borderRadius: '6px',
                        border: `2px solid ${hub.color}`,
                        background: `${hub.color}33`,
                        opacity: 0.5,
                        filter: 'blur(2.5px)',
                        boxShadow: `0 0 12px 3px ${hub.color}`,
                        pointerEvents: 'none'
                      }}
                    />
                    <img
                      src={getFlagSrc(hub.code)}
                      alt={hub.country}
                      style={{
                        width: '28px',
                        height: '19px',
                        objectFit: 'cover',
                        borderRadius: '3px',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
                        display: 'block',
                        position: 'relative',
                        zIndex: 2,
                        flexShrink: 0
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontSize: '0.86rem', fontWeight: 800, lineHeight: 1.15 }}>
                      {hub.city}
                    </div>
                    <div style={{ color: hub.color, fontSize: '0.72rem', fontWeight: 700 }}>
                      {hub.title}
                    </div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.68rem', marginTop: '2px' }}>
                      🕒 {hub.hours} &bull; 💳 {hub.currency}
                    </div>
                  </div>
                </div>

                {/* Pointer Arrow */}
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: `8px solid ${hub.color}`,
                    margin: '0 auto'
                  }}
                />
              </div>
            );
          }

          // Otherwise, render a sleek, compact, non-cluttering circular pin marker!
          return (
            <div
              key={hub.code}
              onClick={() => jumpToHub(hub)}
              onMouseEnter={() => setHoveredHub(hub)}
              onMouseLeave={() => setHoveredHub(null)}
              style={{
                position: 'absolute',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, -50%)',
                zIndex: isHovered ? 35 : 20,
                cursor: 'pointer',
                pointerEvents: 'auto',
                transition: 'transform 0.18s ease'
              }}
              title={`${hub.city}, ${hub.country} (${hub.title})`}
            >
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* Glowing Orbit around country logo flag - blurred and transparent at 50% */}
                <div
                  style={{
                    position: 'absolute',
                    width: isHovered ? '46px' : '38px',
                    height: isHovered ? '46px' : '38px',
                    borderRadius: '50%',
                    border: `2.5px solid ${hub.color}`,
                    background: `${hub.color}33`,
                    opacity: 0.5,
                    filter: 'blur(2.5px)',
                    boxShadow: `0 0 16px 4px ${hub.color}`,
                    pointerEvents: 'none',
                    transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                />

                {/* Secondary orbit ring track at 50% opacity */}
                <div
                  style={{
                    position: 'absolute',
                    width: isHovered ? '42px' : '34px',
                    height: isHovered ? '42px' : '34px',
                    borderRadius: '50%',
                    border: `1.5px dashed ${hub.color}`,
                    opacity: 0.5,
                    pointerEvents: 'none',
                    transition: 'all 0.25s ease'
                  }}
                />

                {/* Flag Icon Circle */}
                <div
                  style={{
                    width: isHovered ? '32px' : '26px',
                    height: isHovered ? '32px' : '26px',
                    borderRadius: '50%',
                    background: 'rgba(20, 5, 15, 0.95)',
                    border: `2px solid ${hub.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 14px rgba(0, 0, 0, 0.7), 0 0 10px ${hub.color}80`,
                    backdropFilter: 'blur(4px)',
                    transform: isHovered ? 'scale(1.25)' : 'scale(1)',
                    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    overflow: 'hidden',
                    padding: '2px',
                    position: 'relative',
                    zIndex: 2
                  }}
                >
                  <img
                    src={getFlagSrc(hub.code)}
                    alt={hub.country}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                </div>
              </div>

              {/* Sleek Hover Tooltip */}
              {isHovered && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%) translateY(-6px)',
                    background: 'rgba(18, 4, 13, 0.96)',
                    backdropFilter: 'blur(8px)',
                    border: `1.5px solid ${hub.color}`,
                    borderRadius: '8px',
                    padding: '4px 10px',
                    whiteSpace: 'nowrap',
                    color: '#fff',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    boxShadow: '0 8px 22px rgba(0, 0, 0, 0.7)',
                    zIndex: 45,
                    pointerEvents: 'none'
                  }}
                >
                  {hub.city} &bull; <span style={{ color: hub.color, fontWeight: 600 }}>{hub.country}</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Interaction Hint Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: '14px',
            left: '14px',
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--cherry-border)',
            borderRadius: '9999px',
            padding: '5px 14px',
            fontSize: '0.74rem',
            color: 'var(--text-dim)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            pointerEvents: 'none'
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--sakura-pink)' }} />
          <span>{t('about.mapInteractionHint', '360° Drag to rotate · Scroll to zoom · Click pins to inspect')}</span>
        </div>

        {/* Highlighted Country Badge Count */}
        <div
          style={{
            position: 'absolute',
            bottom: '14px',
            right: '14px',
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--cherry-border)',
            borderRadius: '9999px',
            padding: '5px 14px',
            fontSize: '0.74rem',
            color: 'var(--crust-gold)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>✨</span>
          <span>{t('about.nationsConnected', '17 Operating Nations Connected')}</span>
        </div>
      </div>

      {/* Selected Hub Details Panel */}
      {selectedHub && (
        <div
          style={{
            marginTop: '20px',
            background: 'var(--cherry-card)',
            border: `2px solid ${selectedHub.color}`,
            borderRadius: '18px',
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '54px',
                height: '38px',
                borderRadius: '8px',
                background: 'rgba(230, 57, 96, 0.15)',
                border: `2px solid ${selectedHub.color}`,
                boxShadow: `0 4px 14px ${selectedHub.color}55`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0
              }}
            >
              <img
                src={getFlagSrc(selectedHub.code)}
                alt={selectedHub.country}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', color: 'var(--cheesecake-cream)' }}>
                  {selectedHub.city}, {selectedHub.country}
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: selectedHub.color,
                    border: `1px solid ${selectedHub.color}`
                  }}
                >
                  {selectedHub.title}
                </span>
              </div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.84rem', marginTop: '3px' }}>
                📍 {selectedHub.address} &bull; 🕒 {selectedHub.hours} &bull; 💳 {selectedHub.currency}
              </div>
              <div style={{ color: 'var(--crust-gold)', fontSize: '0.84rem', marginTop: '4px', fontWeight: 600 }}>
                🍰 {t('about.regionalSignature', 'Regional Signature:')} <em>{selectedHub.specialty}</em>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => handleSelectRegion(selectedHub)}
              style={{
                padding: '9px 20px',
                borderRadius: '9999px',
                backgroundColor: currentRegion === selectedHub.code ? 'var(--mint-fresh)' : 'var(--raspberry-coulis)',
                color: currentRegion === selectedHub.code ? '#000' : '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(230, 57, 96, 0.35)'
              }}
            >
              {currentRegion === selectedHub.code ? t('about.activeRegion', '✓ Active Region') : `${t('about.switchStoreTo', 'Switch Store to')} ${selectedHub.country}`}
            </button>
          </div>
        </div>
      )}

      {/* Country Filter Pills Grid */}
      <div
        style={{
          marginTop: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          alignItems: 'center'
        }}
      >
        <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600, marginRight: '4px' }}>
          {t('about.exploreHub', 'Explore Hub:')}
        </span>
        {HUBS.map((hub) => (
          <button
            key={hub.code}
            type="button"
            onClick={() => jumpToHub(hub)}
            style={{
              padding: '5px 12px',
              borderRadius: '9999px',
              border: selectedHub?.code === hub.code ? `1.5px solid ${hub.color}` : '1px solid var(--cherry-border)',
              background: selectedHub?.code === hub.code ? 'rgba(230, 57, 96, 0.25)' : 'rgba(255, 255, 255, 0.04)',
              color: selectedHub?.code === hub.code ? '#fff' : 'var(--text-dim)',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <img
              src={getFlagSrc(hub.code)}
              alt={hub.country}
              style={{
                width: '16px',
                height: '11px',
                objectFit: 'cover',
                borderRadius: '2px',
                display: 'inline-block'
              }}
            />
            <span>{hub.city}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

