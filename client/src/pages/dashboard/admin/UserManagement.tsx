import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import api from '../../../services/api';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/auth/users'); // Assuming this exists or needed
            setUsers(response.data.data.users);
        } catch (err) {
            console.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-4 md:space-y-6">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">PLATFORM_USER_MAINFRAME</h2>
            <div className="bg-white rounded-[2rem] md:rounded-[40px] shadow-xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto min-w-full">
                    <table className="w-full text-left min-w-[500px]">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 md:px-8 py-3 md:py-4 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">User_Entity</th>
                                <th className="px-6 md:px-8 py-3 md:py-4 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Role_Protocol</th>
                                <th className="px-6 md:px-8 py-3 md:py-4 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-all">
                                    <td className="px-6 md:px-8 py-4 md:py-6">
                                        <div className="font-bold text-slate-900 text-sm md:text-base">{user.name}</div>
                                        <div className="text-[10px] md:text-xs text-slate-400 truncate max-w-[150px] md:max-w-none">{user.email}</div>
                                    </td>
                                    <td className="px-6 md:px-8 py-4 md:py-6 text-center">
                                        <span className={`px-2.5 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase ${user.role === 'admin' ? 'bg-red-100 text-red-600' :
                                            user.role === 'vendor' ? 'bg-blue-100 text-blue-600' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 md:px-8 py-4 md:py-6 text-right">
                                        <button className="text-slate-400 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
