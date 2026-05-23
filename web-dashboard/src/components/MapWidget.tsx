import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapWidgetProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    title?: string;
    description?: string;
    color?: 'red' | 'green' | 'blue' | 'orange';
    pulsing?: boolean;
  }>;
  height?: string;
  className?: string;
}

const markerIcons: Record<string, L.DivIcon> = {
  red: L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:12px;height:12px;background:#D32F2F;border:2px solid #fff;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  }),
  green: L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:12px;height:12px;background:#2E7D32;border:2px solid #fff;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  }),
  blue: L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:12px;height:12px;background:#1565C0;border:2px solid #fff;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  }),
  orange: L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:12px;height:12px;background:#FF6F00;border:2px solid #fff;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  }),
};

function PulsingMarker({ position }: { position: [number, number] }) {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    const pulseIcon = L.divIcon({
      className: 'custom-pulse-marker',
      html: `
        <div style="position:relative;width:24px;height:24px;">
          <div style="position:absolute;inset:0;border-radius:50%;background:#D32F2F;animation:pulse 2s infinite;opacity:0.4;"></div>
          <div style="position:absolute;top:6px;left:6px;width:12px;height:12px;border-radius:50%;background:#D32F2F;border:2px solid #fff;"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const marker = L.marker(position, { icon: pulseIcon }).addTo(map);
    markerRef.current = marker;

    return () => {
      map.removeLayer(marker);
    };
  }, [map, position]);

  return null;
}

export default function MapWidget({
  center = [-2.5, 118],
  zoom = 5,
  markers = [],
  height = '400px',
  className,
}: MapWidgetProps) {
  const { BaseLayer } = LayersControl;

  return (
    <div className={className} style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
        zoomControl={true}
      >
        <LayersControl position="topright">
          <BaseLayer checked name="OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </BaseLayer>
          <BaseLayer name="Satellite">
            <TileLayer
              attribution='&copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </BaseLayer>
          <BaseLayer name="Topographic">
            <TileLayer
              attribution='&copy; <a href="https://www.opentopomap.org">OpenTopoMap</a>'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            />
          </BaseLayer>
        </LayersControl>

        {markers.map((marker, i) => {
          const icon = markerIcons[marker.color || 'blue'] || markerIcons.blue;

          if (marker.pulsing) {
            return <PulsingMarker key={i} position={marker.position} />;
          }

          return (
            <Marker key={i} position={marker.position} icon={icon}>
              {marker.title && (
                <Popup>
                  <div className="min-w-[150px]">
                    <h3 className="font-semibold text-sm">{marker.title}</h3>
                    {marker.description && (
                      <p className="text-xs text-gray-500 mt-1">{marker.description}</p>
                    )}
                  </div>
                </Popup>
              )}
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
