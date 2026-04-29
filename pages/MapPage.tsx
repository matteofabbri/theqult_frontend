
import React, { useState, useMemo, useEffect } from 'react';
import { useAuth, useData, getFlagUrl } from '../hooks/useStore';
import UserAvatar from '../components/UserAvatar';
import { Link } from 'react-router-dom';
import { MessageIcon, UsersIcon } from '../components/Icons';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet's default icon issue with bundlers
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Explicitly set the default icon paths
const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIconRetina,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to handle map invalidation and resizing
const MapController = () => {
    const map = useMap();
    
    useEffect(() => {
        // Force a resize check after a short delay to ensure container is fully rendered
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 300);
        
        return () => clearTimeout(timer);
    }, [map]);
    
    return null;
};

interface MapPath {
  id: string; // ISO 2-letter code or similar
  name: string;
}

const MapPage: React.FC = () => {
    const { currentUser, users, getUserById, isAdmin } = useAuth();
    const { territoryAssignments, assignTerritory } = useData();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [geoData, setGeoData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGeoJSON = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
                if (!response.ok) throw new Error('Failed to fetch GeoJSON');
                const data = await response.json();
                setGeoData(data);
            } catch (err) {
                console.error('GeoJSON Load Error:', err);
                setError('Impossibile caricare i confini geografici.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchGeoJSON();
    }, []);

    const selectedTerritoryName = useMemo(() => {
        if (!selectedId || !geoData) return null;
        const feature = geoData.features.find((f: any) => f.properties.ISO_A3 === selectedId || f.properties.ADMIN === selectedId);
        return feature ? feature.properties.ADMIN : selectedId;
    }, [selectedId, geoData]);

    const mapStyle = (feature: any) => {
        const territoryId = feature.properties.ISO_A3;
        const isSelected = selectedId === territoryId;

        return {
            fillColor: isSelected ? '#3B82F6' : 'transparent',
            weight: isSelected ? 2 : 1,
            opacity: 1,
            color: isSelected ? '#2563EB' : '#4b5563',
            fillOpacity: isSelected ? 0.2 : 0,
        };
    };

    const onEachFeature = (feature: any, layer: L.Layer) => {
        layer.on({
            click: (e: any) => {
                const territoryId = feature.properties.ISO_A3;
                setSelectedId(territoryId);
                L.DomEvent.stopPropagation(e);
            },
            mouseover: (e: any) => {
                const layer = e.target;
                layer.setStyle({
                    fillOpacity: 0.1,
                    fillColor: '#3B82F6',
                    weight: 1.5,
                    color: '#6b7280'
                });
            },
            mouseout: (e: any) => {
                const layer = e.target;
                const territoryId = feature.properties.ISO_A3;
                if (selectedId !== territoryId) {
                    layer.setStyle(mapStyle(feature));
                }
            }
        });
    };

    return (
        <div className="container mx-auto px-4 h-[calc(100vh-8rem)]">
            <div className="flex flex-col lg:flex-row h-full gap-4">
                
                {/* Mappa Main View */}
                <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col relative min-h-[400px]">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white z-20">
                        <div className="flex items-center gap-3">
                            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest italic">
                                Worldwide Map
                            </h2>
                        </div>
                    </div>
                    
                    <div className="flex-1 relative bg-gray-100">
                        {isLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-[1000]">
                                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Map Data...</p>
                            </div>
                        )}
                        
                        <MapContainer 
                            center={[20, 0]} 
                            zoom={2} 
                            style={{ height: '100%', width: '100%', minHeight: '500px' }}
                            scrollWheelZoom={true}
                            className="z-10"
                        >
                            <MapController />
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {geoData && (
                                <GeoJSON 
                                    data={geoData} 
                                    style={mapStyle}
                                    onEachFeature={onEachFeature}
                                />
                            )}
                        </MapContainer>
                    </div>
                </div>

                {/* Sidebar Info */}
                <aside className="w-full lg:w-[380px] shrink-0 flex flex-col gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col flex-1 overflow-hidden">
                        {selectedId ? (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 flex flex-col h-full">
                                <div className="flex items-center gap-4">
                                    <div className="min-w-0">
                                        <h2 className="text-2xl font-black text-gray-900 tracking-tighter truncate uppercase italic leading-tight">
                                            {selectedTerritoryName}
                                        </h2>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">ISO CODE: {selectedId}</p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100">
                                    <p className="text-sm text-gray-600">
                                        Viewing details for {selectedTerritoryName}. This territory is part of the global Qult network.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-30 select-none">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 border border-gray-200">
                                    <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A2 2 0 013 15.487V6a2 2 0 011.106-1.789l5.447-2.724a2 2 0 011.894 0l5.447 2.724A2 2 0 0118 6v9.487a2 2 0 01-1.106 1.789L11.447 20a2 2 0 01-1.894 0z" /></svg>
                                </div>
                                <h2 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter">Region Database</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-2 tracking-widest leading-relaxed">
                                    Select a country on the map to view regional information.
                                </p>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
            <style>{`
                .leaflet-container {
                    background: #f8fafc;
                }
                .leaflet-bar button {
                    background-color: white;
                    border: 1px solid #e2e8f0;
                }
            `}</style>
        </div>
    );
};

export default MapPage;
