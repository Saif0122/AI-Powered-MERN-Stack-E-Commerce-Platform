import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

export interface LowStockAlert {
    productId: string;
    title: string;
    stock: number;
    threshold: number;
    vendorId: string;
    timestamp: string;
}

export const useSocketAlert = () => {
    const { user } = useAuth();
    const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!user) return;

        // Initialize socket
        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
        socketRef.current = socket;

        // Join appropriate room
        if (user.role === 'admin') {
            socket.emit('join-admin');
        }

        if (user.role === 'seller' || user.role === 'admin') {
            socket.emit('join-vendor', user.id);
        }

        // Listen for low stock alerts
        socket.on('low_stock_alert', (data: LowStockAlert) => {
            console.log('Low stock alert received:', data);
            setAlerts((prev) => [data, ...prev]);
        });

        socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err.message);
        });

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [user]);

    const dismissAlert = (productId: string) => {
        setAlerts((prev) => prev.filter((a) => a.productId !== productId));
    };

    const clearAllAlerts = () => {
        setAlerts([]);
    };

    return {
        alerts,
        dismissAlert,
        clearAllAlerts,
        socket: socketRef.current,
    };
};
