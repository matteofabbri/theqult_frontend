
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

    const assignment = useMemo(() => selectedId ? territoryAssignments.find(a => a.territoryId === selectedId) : null, [territoryAssignments, selectedId]);
    const ambassador = useMemo(() => assignment ? getUserById(assignment.userId) : null, [assignment, getUserById]);

    const filteredUsers = useMemo(() => {
        if (!searchTerm.trim()) return [];
        return users.filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5);
    }, [users, searchTerm]);

    const handleAssign = (userId: string) => {
        if (selectedId) {
            assignTerritory(selectedId, userId);
            setSearchTerm('');
        }
    };

    const mapStyle = (feature: any) => {
        const territoryId = feature.properties.ISO_A3;
        const isSelected = selectedId === territoryId;

        return {
            fillColor: 'transparent',
            weight: isSelected ? 2 : 1,
            opacity: 1,
            color: isSelected ? '#FF4500' : '#4b5563',
            fillOpacity: 0,
        };
    };

    const onEachFeature = (feature: any, layer: L.Layer) => {
        layer.on({
            click: (e) => {
                const territoryId = feature.properties.ISO_A3;
                setSelectedId(territoryId);
                L.DomEvent.stopPropagation(e);
            },
            mouseover: (e) => {
                const layer = e.target;
                layer.setStyle({
                    fillOpacity: 0.9,
                    weight: 1.5,
                    color: '#6b7280'
                });
            },
            mouseout: (e) => {
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
                                Worldwide Operations Map
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
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <UsersIcon className="w-4 h-4" /> Delegazione Territoriale
                                    </h3>
                                    
                                    {ambassador ? (
                                        <div className="bg-gray-900 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
                                            <div className="flex items-center gap-4 mb-5 relative z-10">
                                                <UserAvatar user={ambassador} className="w-14 h-14 border-2 border-primary shadow-lg" />
                                                <div className="min-w-0">
                                                    <Link to={`/u/${ambassador.username}`} className="font-black text-xl hover:text-primary transition-colors block truncate">
                                                        u/{ambassador.username}
                                                    </Link>
                                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Responsabile Locale</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 relative z-10">
                                                <Link to={`/u/${ambassador.username}`} className="flex-1 bg-white text-gray-900 font-black py-2.5 rounded-xl text-[10px] text-center hover:bg-primary hover:text-white transition-all uppercase tracking-widest">Dossier</Link>
                                                <Link to={`/messages/${ambassador.username}`} className="px-4 bg-primary text-white rounded-xl hover:bg-orange-600 transition-all flex items-center justify-center shadow-md">
                                                    <MessageIcon className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center opacity-60">
                                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">In Attesa di Incarico</p>
                                        </div>
                                    )}
                                </div>

                                {currentUser && isAdmin(currentUser.id) && (
                                    <div className="pt-6 mt-auto border-t border-gray-100">
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Assegna u/ al Settore</label>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-bold text-gray-900 shadow-inner"
                                                placeholder="Ricerca utente..."
                                            />
                                            {filteredUsers.length > 0 && (
                                                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-[1050] overflow-hidden divide-y divide-gray-50 animate-in fade-in slide-in-from-bottom-2">
                                                    {filteredUsers.map(user => (
                                                        <button 
                                                            key={user.id}
                                                            onClick={() => handleAssign(user.id)}
                                                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-primary hover:text-white text-left transition-all"
                                                        >
                                                            <UserAvatar user={user} className="w-8 h-8" />
                                                            <span className="font-bold text-sm">u/{user.username}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-30 select-none">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 border border-gray-200">
                                    <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A2 2 0 013 15.487V6a2 2 0 011.106-1.789l5.447-2.724a2 2 0 011.894 0l5.447 2.724A2 2 0 0118 6v9.487a2 2 0 01-1.106 1.789L11.447 20a2 2 0 01-1.894 0z" /></svg>
                                </div>
                                <h2 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter">Database Locale</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-2 tracking-widest leading-relaxed">
                                    Seleziona un'area geografica sulla mappa per interrogare i record territoriali.
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
