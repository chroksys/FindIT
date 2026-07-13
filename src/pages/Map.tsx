import React, { useMemo, useState } from 'react';
import Map, { Source, Layer } from 'react-map-gl/mapbox';
import type { HeatmapLayerSpecification, CircleLayerSpecification } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEventContext } from '../context/EventContext';
import type { Event } from '../context/EventContext';
import { EventCard } from '../components/EventCard';
import { X } from '@phosphor-icons/react';

// Replace this with your actual token from .env
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const MAX_ZOOM_LEVEL = 15;

const heatmapLayer: HeatmapLayerSpecification = {
  id: 'events-heat',
  type: 'heatmap',
  source: 'events',
  maxzoom: MAX_ZOOM_LEVEL,
  paint: {
    // Increase the heatmap weight based on frequency and property magnitude
    'heatmap-weight': 1,
    // Increase the heatmap color weight weight by zoom level
    // heatmap-intensity is a multiplier on top of heatmap-weight
    'heatmap-intensity': [
      'interpolate',
      ['linear'],
      ['zoom'],
      0, 1,
      MAX_ZOOM_LEVEL, 3
    ],
    // Color ramp from fully transparent to Electric Blue to Electric Yellow
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0, 'rgba(0, 243, 255, 0)',
      0.2, 'rgba(0, 243, 255, 0.2)',
      0.4, 'rgba(0, 243, 255, 0.5)',
      0.6, 'rgba(0, 243, 255, 0.8)',
      0.8, 'rgba(255, 235, 59, 0.8)',
      1, 'rgba(255, 235, 59, 1)'
    ],
    // Adjust the heatmap radius by zoom level
    'heatmap-radius': [
      'interpolate',
      ['linear'],
      ['zoom'],
      0, 2,
      MAX_ZOOM_LEVEL, 20
    ],
    // Transition from heatmap to circle layer by zoom level
    'heatmap-opacity': [
      'interpolate',
      ['linear'],
      ['zoom'],
      7, 1,
      MAX_ZOOM_LEVEL, 0
    ]
  }
};

const circleLayer: CircleLayerSpecification = {
  id: 'events-point',
  type: 'circle',
  source: 'events',
  minzoom: 10,
  paint: {
    'circle-radius': [
      'interpolate',
      ['linear'],
      ['zoom'],
      10, 3,
      MAX_ZOOM_LEVEL, 8
    ],
    'circle-color': '#ffeb3b',
    'circle-stroke-color': '#000000',
    'circle-stroke-width': 1,
    'circle-opacity': [
      'interpolate',
      ['linear'],
      ['zoom'],
      10, 0,
      12, 1
    ]
  }
};

export const MapView: React.FC = () => {
  const { events } = useEventContext();
  const [selectedEvents, setSelectedEvents] = useState<Event[] | null>(null);

  // Generate GeoJSON from events
  const data = useMemo(() => {
    // In a real app, you'd filter out events without coordinates.
    // For this demo, let's artificially assign coordinates around Kampala to events without them
    // so the heatmap looks populated.
    const baseLat = 0.3476;
    const baseLng = 32.5825;

    const features = events.map((event) => {
      // Create deterministic random offset based on event ID string length so it doesn't jump
      const randomSeed = event.id.length * 0.01;
      const lat = event.coordinates?.lat || baseLat + (randomSeed - 0.5) * 0.1;
      const lng = event.coordinates?.lng || baseLng + (randomSeed - 0.5) * 0.1;
      
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties: {
          eventId: event.id
        }
      };
    });

    return { type: 'FeatureCollection', features };
  }, [events]);

  const onClick = (event: any) => {
    // Check if clicked on a point or heatmap
    const feature = event.features?.[0];
    if (feature) {
      // For UX demonstration, we just randomly pick 2-3 events to show in the bottom sheet.
      const nearbyEvents = [...events].sort(() => 0.5 - Math.random()).slice(0, 3);
      
      if (nearbyEvents.length > 0) {
        setSelectedEvents(nearbyEvents);
      }
    } else {
      setSelectedEvents(null);
    }
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000', zIndex: 10 }}>
      <Map
        initialViewState={{
          longitude: 32.5825,
          latitude: 0.3476,
          zoom: 11
        }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={['events-point', 'events-heat']}
        onClick={onClick}
      >
        <Source type="geojson" data={data as any}>
          <Layer {...heatmapLayer} />
          <Layer {...circleLayer} />
        </Source>
      </Map>

      {/* Close/Back Button */}
      <button 
        onClick={() => window.history.back()}
        className="btn-ghost"
        style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 100, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '12px' }}
      >
        <X size={24} color="white" />
      </button>

      {/* Bottom Sheet */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        padding: 'var(--spacing-large)',
        paddingBottom: 'calc(var(--spacing-large) + 80px)', // Account for mobile navbar
        transform: selectedEvents ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 100,
        borderTop: '1px solid var(--border-color)',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.5)'
      }}>
        {selectedEvents && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-medium)' }}>
              <h2 className="text-section" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffeb3b', display: 'inline-block', boxShadow: '0 0 8px rgba(255,235,59,0.8)' }}></span>
                Hot Zone Events
              </h2>
              <button 
                onClick={() => setSelectedEvents(null)}
                className="btn-ghost"
                style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <X size={20} color="white" />
              </button>
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: 'var(--spacing-medium)', 
              overflowX: 'auto', 
              paddingBottom: 'var(--spacing-small)',
              scrollSnapType: 'x mandatory'
            }}>
              {selectedEvents.map(event => (
                <div key={event.id} style={{ minWidth: '300px', scrollSnapAlign: 'start' }}>
                  <EventCard {...event} date={event.displayDate} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
