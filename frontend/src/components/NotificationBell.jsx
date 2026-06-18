import { useState, useEffect, useRef } from 'react';
import { IconBell, IconBellRinging, IconX, IconRefresh, IconAlertTriangle } from '@tabler/icons-react';
import { apiFetch } from '@/utils';

const TYPE_CONFIG = {
    renouvellement_1_mois:    { color: 'text-warning',  bg: 'bg-warning-light',  dot: 'bg-warning'  },
    renouvellement_1_semaine: { color: 'text-orange-500', bg: 'bg-orange-50',    dot: 'bg-orange-500' },
    renouvellement_1_jour:    { color: 'text-danger',   bg: 'bg-[#FFF0F0]',      dot: 'bg-danger'   },
    changement_tranche_age:   { color: 'text-brand',    bg: 'bg-blue-light',     dot: 'bg-brand'    },
};

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "à l'instant";
    if (m < 60) return `il y a ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `il y a ${h}h`;
    const d = Math.floor(h / 24);
    return `il y a ${d} jour${d > 1 ? 's' : ''}`;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unread, setUnread] = useState(0);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef(null);
    const buttonRef = useRef(null);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await apiFetch('/api/notifications');
            setNotifications(data);
            setUnread(data.filter((n) => !n.lu).length);
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        function handleClick(e) {
            if (
                panelRef.current && !panelRef.current.contains(e.target) &&
                buttonRef.current && !buttonRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    const handleOpen = () => {
        setOpen((v) => !v);
    };

    const markAllRead = async () => {
        try {
            await apiFetch('/api/notifications/read-all', { method: 'PUT' });
            setNotifications((prev) => prev.map((n) => ({ ...n, lu: 1 })));
            setUnread(0);
        } catch {
            // silent
        }
    };

    const markOneRead = async (id) => {
        try {
            await apiFetch(`/api/notifications/${id}/read`, { method: 'PUT' });
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, lu: 1 } : n))
            );
            setUnread((prev) => Math.max(0, prev - 1));
        } catch {
            // silent
        }
    };

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={handleOpen}
                className="relative flex items-center justify-center w-9 h-9 rounded-xl text-secondary hover:text-anthracite hover:bg-surface transition-colors"
                aria-label="Notifications"
            >
                {unread > 0
                    ? <IconBellRinging size={20} stroke={2} className="text-brand" />
                    : <IconBell size={20} stroke={1.8} />
                }
                {unread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-danger text-white text-[10px] font-black leading-none">
                        {unread > 99 ? '99+' : unread}
                    </span>
                )}
            </button>

            {open && (
                <div
                    ref={panelRef}
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-lg border border-border z-50 overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <h3 className="text-sm font-bold text-anthracite">Notifications</h3>
                        <div className="flex items-center gap-1">
                            {unread > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="text-xs text-brand hover:underline font-semibold px-2 py-1 rounded-lg hover:bg-blue-light transition-colors"
                                >
                                    Tout lire
                                </button>
                            )}
                            <button
                                onClick={fetchNotifications}
                                className="p-1.5 rounded-lg text-secondary hover:bg-surface transition-colors"
                                aria-label="Actualiser"
                            >
                                <IconRefresh size={14} stroke={2} className={loading ? 'animate-spin' : ''} />
                            </button>
                            <button
                                onClick={() => setOpen(false)}
                                className="p-1.5 rounded-lg text-secondary hover:bg-surface transition-colors"
                            >
                                <IconX size={14} stroke={2} />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-96 overflow-y-auto divide-y divide-border">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-2 text-secondary">
                                <IconBell size={32} stroke={1.2} />
                                <p className="text-sm">Aucune notification</p>
                            </div>
                        ) : (
                            notifications.map((notif) => {
                                const cfg = TYPE_CONFIG[notif.type] ?? {
                                    color: 'text-secondary',
                                    bg: 'bg-surface',
                                    dot: 'bg-secondary',
                                };
                                return (
                                    <button
                                        key={notif.id}
                                        onClick={() => !notif.lu && markOneRead(notif.id)}
                                        className={`w-full text-left px-4 py-3 flex gap-3 items-start transition-colors hover:bg-surface ${
                                            notif.lu ? 'opacity-60' : ''
                                        }`}
                                    >
                                        <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${notif.lu ? 'bg-border' : cfg.dot}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-bold leading-snug ${notif.lu ? 'text-secondary' : 'text-anthracite'}`}>
                                                {notif.titre}
                                            </p>
                                            <p className="text-xs text-secondary mt-0.5 leading-relaxed line-clamp-2">
                                                {notif.message}
                                            </p>
                                            <p className="text-[10px] text-secondary/60 mt-1">
                                                {timeAgo(notif.createdAt)}
                                            </p>
                                        </div>
                                        {notif.type === 'changement_tranche_age' && (
                                            <IconAlertTriangle size={14} stroke={2} className={`shrink-0 mt-0.5 ${cfg.color}`} />
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="px-4 py-2.5 border-t border-border text-center">
                            <p className="text-xs text-secondary">{notifications.length} notification{notifications.length > 1 ? 's' : ''} au total</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
