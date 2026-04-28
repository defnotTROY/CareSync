import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export function useLiveQueue() {
    const [waitingQueue, setWaitingQueue] = useState([]);
    const [servingNow, setServingNow] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchQueueData = useCallback(async () => {
        try {
            // Only set loading to true if we don't have data yet to avoid flashing on background refreshes
            if (waitingQueue.length === 0 && servingNow.length === 0) {
                setLoading(true);
            }
            
            const { data: appointments, error } = await supabase
                .from('appointments')
                .select('*')
                .in('status', ['ON_CASHIER', 'CHECKED_IN', 'ON_DOCTOR', 'IN_PROGRESS'])
                .order('created_at', { ascending: true });

            if (error) throw error;

            if (!appointments || appointments.length === 0) {
                setWaitingQueue([]);
                setServingNow([]);
                setLoading(false);
                return;
            }

            const userIds = [...new Set(appointments.map(a => a.user_id).filter(Boolean))];
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name')
                .in('id', userIds);

            const merged = appointments.map(apt => ({
                ...apt,
                profiles: (profiles || []).find(p => String(p.id) === String(apt.user_id)) || { full_name: "Unknown Patient" }
            }));

            setWaitingQueue(merged.filter(a => a.status === 'ON_CASHIER'));
            setServingNow(merged.filter(a => ['CHECKED_IN', 'ON_DOCTOR', 'IN_PROGRESS'].includes(a.status)));
        } catch (err) {
            console.error("Queue fetch error:", err.message);
        } finally {
            setLoading(false);
        }
    }, [waitingQueue.length, servingNow.length]);

    useEffect(() => {
        fetchQueueData();

        const channel = supabase
            .channel('live-queue-sync')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'appointments' },
                (payload) => {
                    // Force remove if status is COMPLETED or EXPIRED or CANCELLED
                    if (payload.new && ['COMPLETED', 'EXPIRED', 'CANCELLED'].includes(payload.new.status)) {
                        setWaitingQueue(prev => prev.filter(a => a.id !== payload.new.id));
                        setServingNow(prev => prev.filter(a => a.id !== payload.new.id));
                    } else {
                        fetchQueueData();
                    }
                }
            )
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [fetchQueueData]);

    return { waitingQueue, servingNow, loading, refresh: fetchQueueData };
}
