import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { CrimeStats, District } from '@shared/schema';

// Fix for default markers in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Chennai coordinates and district locations
const CHENNAI_CENTER: [number, number] = [13.0827, 80.2707];

// Chennai district coordinates (approximate centers)
const DISTRICT_COORDINATES: Record<string, [number, number]> = {
  'central': [13.0827, 80.2707], // Central Chennai
  'north': [13.1317, 80.2977], // North Chennai
  'south': [12.9141, 80.2227], // South Chennai
  'tambaram': [12.9249, 80.1000], // Tambaram
  'avadi': [13.1147, 80.0977], // Avadi
  'anna-nagar': [13.0850, 80.2101], // Anna Nagar
  't-nagar': [13.0417, 80.2341], // T.Nagar
  'velachery': [12.9745, 80.2197], // Velachery
};

// Crime intensity colors
const getCrimeIntensityColor = (totalIncidents: number): string => {
  if (totalIncidents > 1000) return '#dc2626'; // High intensity - red
  if (totalIncidents > 500) return '#f97316'; // Medium-high intensity - orange
  if (totalIncidents > 200) return '#eab308'; // Medium intensity - yellow
  return '#22c55e'; // Low intensity - green
};

// Get circle radius based on crime count
const getCrimeRadius = (totalIncidents: number): number => {
  if (totalIncidents > 1000) return 15;
  if (totalIncidents > 500) return 12;
  if (totalIncidents > 200) return 8;
  return 5;
};

interface ChennaiCrimeMapProps {
  crimeStats: CrimeStats[];
  districts: District[];
  selectedDistrict?: string;
  className?: string;
}

export function ChennaiCrimeMap({ 
  crimeStats, 
  districts, 
  selectedDistrict = 'all',
  className = "h-80 w-full rounded-lg"
}: ChennaiCrimeMapProps) {
  const mapRef = useRef<L.Map | null>(null);

  // Calculate total incidents per district
  const districtCrimeData = React.useMemo(() => {
    const data: Record<string, number> = {};
    
    districts.forEach(district => {
      let totalIncidents = 0;
      crimeStats.forEach(stat => {
        const districtIncidents = stat.incidents.filter(
          incident => incident.districtId === district.id
        );
        totalIncidents += districtIncidents.reduce((sum, incident) => sum + incident.count, 0);
      });
      data[district.id] = totalIncidents;
    });
    
    return data;
  }, [crimeStats, districts]);

  // Filter districts based on selection
  const filteredDistricts = React.useMemo(() => {
    if (selectedDistrict === 'all') return districts;
    return districts.filter(district => district.id === selectedDistrict);
  }, [districts, selectedDistrict]);

  // Create hotspot markers for high-crime areas
  const hotspotMarkers = React.useMemo(() => {
    const hotspots: Array<{ 
      position: [number, number]; 
      name: string; 
      severity: 'high' | 'medium' | 'low';
      incidents: number;
    }> = [];

    // Add major hotspots based on crime statistics
    if (districtCrimeData['t-nagar'] > 800) {
      hotspots.push({
        position: [13.0417, 80.2341],
        name: 'T.Nagar Commercial District',
        severity: 'high',
        incidents: districtCrimeData['t-nagar']
      });
    }

    if (districtCrimeData['central'] > 700) {
      hotspots.push({
        position: [13.0827, 80.2707],
        name: 'Central Chennai',
        severity: 'high',
        incidents: districtCrimeData['central']
      });
    }

    if (districtCrimeData['anna-nagar'] > 400) {
      hotspots.push({
        position: [13.0850, 80.2101],
        name: 'Anna Nagar Residential',
        severity: 'medium',
        incidents: districtCrimeData['anna-nagar']
      });
    }

    if (districtCrimeData['velachery'] > 300) {
      hotspots.push({
        position: [12.9745, 80.2197],
        name: 'Velachery IT Corridor',
        severity: 'medium',
        incidents: districtCrimeData['velachery']
      });
    }

    return hotspots;
  }, [districtCrimeData]);

  return (
    <div className={className}>
      <MapContainer
        center={CHENNAI_CENTER}
        zoom={11}
        className="h-full w-full rounded-lg"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* District Crime Circles */}
        {filteredDistricts.map((district) => {
          const position = DISTRICT_COORDINATES[district.id];
          if (!position) return null;

          const incidents = districtCrimeData[district.id] || 0;
          const color = getCrimeIntensityColor(incidents);
          const radius = getCrimeRadius(incidents);

          return (
            <CircleMarker
              key={district.id}
              center={position}
              radius={radius}
              pathOptions={{
                fillColor: color,
                color: color,
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.6
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-foreground">{district.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Population: {district.population.toLocaleString()}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Total Incidents:</span> {incidents}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {district.region} Region
                  </p>
                </div>
              </Popup>
              <Tooltip permanent={radius > 10}>
                <div className="text-xs">
                  <div className="font-medium">{district.name}</div>
                  <div>{incidents} incidents</div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}

        {/* Crime Hotspot Markers */}
        {hotspotMarkers.map((hotspot, index) => (
          <Marker key={index} position={hotspot.position}>
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-foreground">{hotspot.name}</h3>
                <p className="text-sm">
                  <span 
                    className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      hotspot.severity === 'high' ? 'bg-red-500' : 
                      hotspot.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                  />
                  {hotspot.severity.charAt(0).toUpperCase() + hotspot.severity.slice(1)} Priority
                </p>
                <p className="text-sm">
                  <span className="font-medium">Incidents:</span> {hotspot.incidents}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Click for detailed analysis
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
