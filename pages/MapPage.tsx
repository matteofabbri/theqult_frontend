
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAuth, useData, getFlagUrl } from '../hooks/useStore';
import UserAvatar from '../components/UserAvatar';
import { Link } from 'react-router-dom';
import { MessageIcon, UsersIcon, PlusIcon } from '../components/Icons';

interface MapPath {
  id: string;
  d: string;
  name: string;
}

const MapPage: React.FC = () => {
    const { currentUser, users, getUserById, isAdmin } = useAuth();
    const { territoryAssignments, assignTerritory } = useData();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [mapPaths, setMapPaths] = useState<MapPath[]>([]);
    const [viewBox, setViewBox] = useState<string>('0 0 1000 600');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const startPos = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

    const regionNames = useMemo(() => new Intl.DisplayNames(['it'], { type: 'region' }), []);

    const fetchMap = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Caricamento diretto dell'asset locale richiesto
            const response = await fetch('/Assets/Images/worldMap.svg');
            if (!response.ok) throw new Error(`Errore Asset: ${response.status}`);
            
            const svgText = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(svgText, 'image/svg+xml');
            const svgEl = doc.querySelector('svg');
            
            if (svgEl && svgEl.getAttribute('viewBox')) {
                setViewBox(svgEl.getAttribute('viewBox')!);
            }

            const paths = Array.from(doc.querySelectorAll('path'));
            const extractedPaths: MapPath[] = paths.map((p, index) => {
                const attrId = p.getAttribute('id') || '';
                const attrTitle = p.getAttribute('title') || p.getAttribute('name') || p.getAttribute('aria-label') || '';
                
                let finalName = attrTitle;
                
                if (attrId && attrId.length === 2) {
                    try {
                        const translated = regionNames.of(attrId.toUpperCase());
                        if (translated) finalName = translated;
                    } catch (e) {
                        finalName = attrTitle || attrId;
                    }
                }

                if (!finalName || /^[pP]-\d+$/.test(finalName) || !isNaN(Number(finalName))) {
                    finalName = attrTitle || `Area ${attrId || index + 1}`;
                }
                
                return {
                    id: attrId || `area-${index}`,
                    d: p.getAttribute('d') || '',
                    name: finalName
                };
            }).filter(p => p.d);

            setMapPaths(extractedPaths);
            setIsLoading(false);
        } catch (err) {
            console.error('Map Load Error:', err);
            setError('Inizializzazione Vettoriale fallita.');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMap();
    }, [regionNames]);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'INPUT') return;
            const step = 80;
            if (e.key === 'ArrowUp') container.scrollBy(0, -step);
            if (e.key === 'ArrowDown') container.scrollBy(0, step);
            if (e.key === 'ArrowLeft') container.scrollBy(-step, 0);
            if (e.key === 'ArrowRight') container.scrollBy(step, 0);
        };

        const handleMouseDown = (e: MouseEvent) => {
            if (zoom <= 1) return;
            isDragging.current = true;
            container.classList.add('cursor-grabbing');
            startPos.current = {
                x: e.pageX - container.offsetLeft,
                y: e.pageY - container.offsetTop,
                scrollLeft: container.scrollLeft,
                scrollTop: container.scrollTop
            };
        };

        const stopDragging = () => {
            isDragging.current = false;
            container.classList.remove('cursor-grabbing');
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging.current) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const y = e.pageY - container.offsetTop;
            const walkX = (x - startPos.current.x) * 1.5;
            const walkY = (y - startPos.current.y) * 1.5;
            container.scrollLeft = startPos.current.scrollLeft - walkX;
            container.scrollTop = startPos.current.scrollTop - walkY;
        };

        window.addEventListener('keydown', handleKeyDown);
        container.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', stopDragging);
        container.addEventListener('mouseleave', stopDragging);
        container.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            container.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', stopDragging);
            container.removeEventListener('mouseleave', stopDragging);
            container.removeEventListener('mousemove', handleMouseMove);
        };
    }, [zoom]);

    const selectedTerritory = useMemo(() => mapPaths.find(t => t.id === selectedId), [selectedId, mapPaths]);
    const hoveredTerritory = useMemo(() => mapPaths.find(t => t.id === hoveredId), [hoveredId, mapPaths]);
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

    return (
        <div className="container mx-auto px-4 h-[calc(100vh-8rem)]">
            <div className="flex flex-col lg:flex-row h-full gap-4">
                
                {/* Mappa Main View */}
                <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col relative">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white z-20 min-h-[64px]">
                        <div className="flex items-center gap-3">
                            <div className="bg-gray-100 px-3 py-1 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest border border-gray-200">
                                SCALE: x{zoom}
                            </div>
                            {hoveredTerritory && (
                                <div className="hidden sm:block bg-gray-900 text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider animate-in fade-in slide-in-from-left-2">
                                    {hoveredTerritory.name}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Controls */}
                    <div className="absolute bottom-6 right-6 z-30 flex flex-col gap-1">
                        <button onClick={() => setZoom(z => Math.min(z + 1, 10))} className="w-12 h-12 bg-white border border-gray-200 rounded-t-xl flex items-center justify-center hover:text-primary transition-all active:scale-95 shadow-lg"><PlusIcon className="w-6 h-6" /></button>
                        <button onClick={() => setZoom(z => Math.max(z - 1, 1))} className="w-12 h-12 bg-white border border-gray-200 flex items-center justify-center hover:text-primary transition-all active:scale-95 shadow-lg"><div className="w-5 h-0.5 bg-current rounded-full" /></button>
                        <button onClick={() => setZoom(1)} className="w-12 h-12 bg-primary text-white rounded-b-xl flex items-center justify-center hover:bg-orange-600 transition-all font-black text-[10px] shadow-lg">RE-FIT</button>
                    </div>
                    
                    {/* Map Interaction Area */}
                    <div ref={scrollContainerRef} className={`flex-1 bg-[#f8fafc] relative overflow-auto custom-scrollbar p-12 transition-colors ${zoom > 1 ? 'cursor-grab' : 'cursor-default'}`}>
                        {isLoading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10">
                                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Asset Loading...</p>
                            </div>
                        ) : error ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 p-8 text-center">
                                <p className="text-red-500 font-bold mb-4">{error}</p>
                                <button onClick={fetchMap} className="bg-gray-900 text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest hover:bg-primary transition-colors shadow-xl">Riprova</button>
                            </div>
                        ) : (
                            <div 
                                className="transition-all duration-300 ease-out origin-top-left mx-auto"
                                style={{ width: `${zoom * 100}%`, minWidth: '100%', aspectRatio: '1000 / 600' }}
                            >
                                <svg viewBox={viewBox} className="w-full h-full block" preserveAspectRatio="xMidYMid meet">
                                    {mapPaths.map((territory, idx) => {
                                        const isAssigned = territoryAssignments.some(a => a.territoryId === territory.id);
                                        const isSelected = selectedId === territory.id;
                                        return (
                                            <path
                                                key={`${territory.id}-${idx}`}
                                                d={territory.d}
                                                onClick={(e) => { e.stopPropagation(); setSelectedId(territory.id); }}
                                                onMouseEnter={() => setHoveredId(territory.id)}
                                                onMouseLeave={() => setHoveredId(null)}
                                                vectorEffect="non-scaling-stroke"
                                                className={`transition-all duration-150 outline-none cursor-pointer ${
                                                    isSelected 
                                                        ? 'fill-primary stroke-gray-900 stroke-[2.5px]' 
                                                        : isAssigned 
                                                            ? 'fill-orange-400 stroke-gray-900 stroke-[1.2px] hover:fill-orange-500' 
                                                            : 'fill-white stroke-gray-300 stroke-[0.5px] hover:fill-gray-100 hover:stroke-gray-500'
                                                }`}
                                            >
                                                <title>{territory.name}</title>
                                            </path>
                                        );
                                    })}
                                </svg>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <aside className="w-full lg:w-[380px] shrink-0 flex flex-col gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col flex-1 overflow-hidden">
                        {selectedTerritory ? (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 flex flex-col h-full">
                                <div className="flex items-center gap-4">
                                    <div className="relative shrink-0">
                                        <img 
                                            src={getFlagUrl(selectedTerritory.id)} 
                                            alt={selectedTerritory.id} 
                                            className="w-20 h-14 rounded shadow-md border border-gray-100 object-cover"
                                            onError={(e) => (e.currentTarget.style.display = 'none')}
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-2xl font-black text-gray-900 tracking-tighter truncate uppercase italic leading-tight">
                                            {selectedTerritory.name}
                                        </h2>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">ID: {selectedTerritory.id}</p>
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
                                                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-gray-50 animate-in fade-in slide-in-from-bottom-2">
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
                                    Seleziona un'area geografica per interrogare i record territoriali.
                                </p>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .cursor-grabbing { cursor: grabbing !important; }
            `}</style>
        </div>
    );
};

export default MapPage;
