import React, { useMemo, useCallback } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import MapboxGL, {
  SymbolLayerStyle,
  LineLayerStyle,
} from "@react-native-mapbox-gl/maps";
import { MAPBOX_TOKEN, MAPBOX_STYLE_URL } from "../../config/env";
import { Colors } from "../../config/theme";
import type { Location } from "../store/slices/emergencySlice";

MapboxGL.setAccessToken(MAPBOX_TOKEN);

// ── Types ─────────────────────────────────────────────────────────────────────
export interface MapMarker {
  id: string;
  coordinate: [number, number]; // [longitude, latitude]
  title?: string;
  description?: string;
  type?: "mountain" | "danger" | "water" | "restpost" | "user" | "custom";
  icon?: string;
  color?: string;
  onPress?: () => void;
}

export interface DangerZone {
  id: string;
  coordinates: [number, number][];
  name: string;
  severity: "high" | "medium" | "low";
}

export interface OfflineRegion {
  bounds: [[number, number], [number, number]]; // [sw, ne]
  metadata: Record<string, any>;
}

export interface MapViewProps {
  style?: ViewStyle;
  centerCoordinate?: [number, number]; // [longitude, latitude]
  zoomLevel?: number;
  showUserLocation?: boolean;
  showBreadcrumb?: boolean;
  breadcrumbTrail?: Location[];
  offlineRegion?: OfflineRegion | null;
  markers?: MapMarker[];
  dangerZones?: DangerZone[];
  onLongPress?: (coordinate: [number, number]) => void;
  onMarkerPress?: (marker: MapMarker) => void;
  onUserLocationUpdate?: (location: Location) => void;
  children?: React.ReactNode;
}

const MapView: React.FC<MapViewProps> = ({
  style,
  centerCoordinate = [106.8275, -6.1754], // Default: Jakarta
  zoomLevel = 5,
  showUserLocation = true,
  showBreadcrumb = false,
  breadcrumbTrail = [],
  offlineRegion = null,
  markers = [],
  dangerZones = [],
  onLongPress,
  onMarkerPress,
  onUserLocationUpdate,
  children,
}) => {
  const cameraRef = React.useRef<MapboxGL.Camera>(null);

  const defaultStyleURL = MAPBOX_STYLE_URL;

  // Layer styles
  const breadcrumbLayerStyle: LineLayerStyle = useMemo(
    () => ({
      lineColor: Colors.breadcrumb,
      lineWidth: 3,
      lineOpacity: 0.8,
      lineCap: "round",
      lineJoin: "round",
    }),
    [],
  );

  const dangerZoneLayerStyle: LineLayerStyle = useMemo(
    () => ({
      lineColor: Colors.danger,
      lineWidth: 2,
      lineOpacity: 0.6,
      lineDashPattern: [2, 2],
    }),
    [],
  );

  const handleLongPress = useCallback(
    (event: any) => {
      const { geometry } = event;
      if (geometry?.coordinates && onLongPress) {
        onLongPress(geometry.coordinates as [number, number]);
      }
    },
    [onLongPress],
  );

  const handleUserLocationUpdate = useCallback(
    (location: any) => {
      if (onUserLocationUpdate && location.coords) {
        onUserLocationUpdate({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          altitude: location.coords.altitude,
          accuracy: location.coords.accuracy,
          timestamp: location.timestamp,
          speed: location.coords.speed,
          heading: location.coords.heading,
        });
      }
    },
    [onUserLocationUpdate],
  );

  // Convert breadcrumb trail to GeoJSON feature collection
  const breadcrumbGeoJSON = useMemo(() => {
    if (!showBreadcrumb || breadcrumbTrail.length < 2) return null;

    return {
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          properties: {},
          geometry: {
            type: "LineString" as const,
            coordinates: breadcrumbTrail.map((p) => [p.longitude, p.latitude]),
          },
        },
      ],
    };
  }, [showBreadcrumb, breadcrumbTrail]);

  // Convert danger zones to GeoJSON
  const dangerGeoJSON = useMemo(() => {
    if (dangerZones.length === 0) return null;

    return {
      type: "FeatureCollection" as const,
      features: dangerZones.map((zone) => ({
        type: "Feature" as const,
        properties: { id: zone.id, name: zone.name, severity: zone.severity },
        geometry: {
          type: "Polygon" as const,
          coordinates: [zone.coordinates],
        },
      })),
    };
  }, [dangerZones]);

  return (
    <View style={[styles.container, style]}>
      <MapboxGL.MapView
        style={styles.map}
        styleURL={defaultStyleURL}
        logoEnabled={false}
        compassEnabled={true}
        attributionEnabled={false}
        surfaceView={true}
        onLongPress={handleLongPress}
      >
        {/* Camera */}
        <MapboxGL.Camera
          ref={cameraRef}
          centerCoordinate={centerCoordinate}
          zoomLevel={zoomLevel}
          animationMode="flyTo"
          animationDuration={300}
        />

        {/* User Location */}
        {showUserLocation && (
          <MapboxGL.UserLocation
            onUpdate={handleUserLocationUpdate}
            renderMode="native"
            visible={true}
            showsUserHeadingIndicator={true}
          />
        )}

        {/* Markers */}
        {markers.map((marker) => (
          <MapboxGL.PointAnnotation
            key={marker.id}
            id={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            onSelected={() => onMarkerPress?.(marker)}
          >
            <View
              style={[
                styles.marker,
                {
                  backgroundColor:
                    marker.color ||
                    (marker.type === "mountain"
                      ? Colors.primary
                      : marker.type === "danger"
                        ? Colors.danger
                        : marker.type === "water"
                          ? Colors.waterSource
                          : Colors.accent),
                },
              ]}
            >
              <MapboxGL.SymbolLayer
                id={`${marker.id}-icon`}
                style={
                  {
                    textField: marker.icon || "📍",
                    textSize: 14,
                  } as SymbolLayerStyle
                }
              />
            </View>
          </MapboxGL.PointAnnotation>
        ))}

        {/* Breadcrumb Trail */}
        {breadcrumbGeoJSON && (
          <MapboxGL.ShapeSource
            id="breadcrumb-source"
            shape={breadcrumbGeoJSON}
          >
            <MapboxGL.LineLayer
              id="breadcrumb-layer"
              style={breadcrumbLayerStyle}
            />
          </MapboxGL.ShapeSource>
        )}

        {/* Danger Zones */}
        {dangerGeoJSON && (
          <MapboxGL.ShapeSource id="danger-source" shape={dangerGeoJSON}>
            <MapboxGL.LineLayer
              id="danger-layer"
              style={dangerZoneLayerStyle}
            />
            <MapboxGL.FillLayer
              id="danger-fill"
              style={{ fillColor: Colors.danger, fillOpacity: 0.1 }}
            />
          </MapboxGL.ShapeSource>
        )}

        {/* Offline Region */}
        {offlineRegion && (
          <MapboxGL.Images
            images={{
              "offline-bounds": "",
            }}
          />
        )}

        {/* Children (Weather overlay, etc.) */}
        {children}
      </MapboxGL.MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  marker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MapView;
