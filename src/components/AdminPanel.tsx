import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  User,
  Hash,
  Trash2
} from "lucide-react";
import { motion } from "motion/react";

export default function AdminPanel() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "transactions"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransactions(records);
      setLoading(false);
    }, (error) => {
      console.error("Admin error fetching transactions:", error);
      setLoading(false);
      handleFirestoreError(error, OperationType.GET, "transactions");
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (txId: string, newStatus: string) => {
    try {
      const txRef = doc(db, "transactions", txId);
      await updateDoc(txRef, { status: newStatus });
    } catch (err) {
      console.error("Error updating transaction status:", err);
      try {
        handleFirestoreError(err, OperationType.UPDATE, `transactions/${txId}`);
      } catch (formattedErr: any) {
        alert("स्थिति अपडेट करने में त्रुटि हुई। (Error updating status)");
      }
    }
  };

  const handleDeleteTransaction = async (txId: string) => {
    try {
      const txRef = doc(db, "transactions", txId);
      await deleteDoc(txRef);
      setDeletingId(null);
    } catch (err) {
      console.error("Error deleting transaction:", err);
      try {
        handleFirestoreError(err, OperationType.DELETE, `transactions/${txId}`);
      } catch (formattedErr: any) {
        alert("विवरण हटाने में असमर्थ। (Unable to delete record)");
      }
    }
  };

  // Calculations
  const totalRevenue = transactions
    .filter(tx => tx.status === "Success" || tx.status === "Approved")
    .reduce((sum, tx) => sum + (tx.amount || 5), 0);

  const pendingCount = transactions.filter(tx => tx.status === "Pending Verification").length;
  const successCount = transactions.filter(tx => tx.status === "Success" || tx.status === "Approved").length;

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      (tx.utr && tx.utr.toLowerCase().includes(search.toLowerCase())) ||
      (tx.userEmail && tx.userEmail.toLowerCase().includes(search.toLowerCase())) ||
      (tx.displayName && tx.displayName.toLowerCase().includes(search.toLowerCase()));
    
    if (statusFilter === "All") return matchesSearch;
    if (statusFilter === "Pending") return matchesSearch && tx.status === "Pending Verification";
    if (statusFilter === "Success") return matchesSearch && (tx.status === "Success" || tx.status === "Approved");
    if (statusFilter === "Rejected") return matchesSearch && tx.status === "Rejected";
    return matchesSearch;
  });

  return (
    <div className="w-full glass rounded-[2rem] p-6 md:p-10 border border-accent/20 space-y-8 shadow-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-serif text-accent tracking-wide flex items-center gap-3">
            <ShieldAlert className="text-accent animate-pulse" /> नियंत्रण कक्ष (ADMIN CONTROL)
          </h2>
          <p className="text-xs text-white/40 uppercase tracking-widest mt-1">UPI UTR Verification Dashboard</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setStatusFilter("All")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${statusFilter === "All" ? "bg-accent text-bg-dark" : "bg-white/5 text-white/50 hover:bg-white/10"}`}
          >
            All
          </button>
          <button 
            onClick={() => setStatusFilter("Pending")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${statusFilter === "Pending" ? "bg-amber-500 text-black font-bold" : "bg-white/5 text-white/50 hover:bg-white/10"}`}
          >
            Pending ({pendingCount})
          </button>
          <button 
            onClick={() => setStatusFilter("Success")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${statusFilter === "Success" ? "bg-green-500 text-black font-bold" : "bg-white/5 text-white/50 hover:bg-white/10"}`}
          >
            Success ({successCount})
          </button>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-black/30 border border-white/5 relative overflow-hidden">
          <div className="text-[10px] uppercase text-white/40 tracking-wider">कुल संग्रह (Total Revenue)</div>
          <div className="text-3xl font-serif text-accent mt-2 flex items-baseline gap-1 font-bold">
            ₹{totalRevenue}
          </div>
          <div className="absolute right-4 bottom-4 opacity-5">
            <DollarSign size={48} />
          </div>
          <div className="text-[10px] text-green-400 font-mono mt-1 flex items-center gap-1">
            <TrendingUp size={10} /> 100% Direct to 9162810434@ptyes
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-black/30 border border-white/5 relative overflow-hidden">
          <div className="text-[10px] uppercase text-white/40 tracking-wider">लंबित सत्यापन (Pending UTR)</div>
          <div className="text-3xl font-serif text-amber-400 mt-2 font-bold">{pendingCount}</div>
          <div className="absolute right-4 bottom-4 opacity-5">
            <Clock size={48} />
          </div>
          <div className="text-[10px] text-white/30 font-mono mt-1">Requires manual bank statement check</div>
        </div>

        <div className="p-5 rounded-2xl bg-black/30 border border-white/5 relative overflow-hidden">
          <div className="text-[10px] uppercase text-white/40 tracking-wider">कुल स्कैन (Total Submissions)</div>
          <div className="text-3xl font-serif text-blue-400 mt-2 font-bold">{transactions.length}</div>
          <div className="absolute right-4 bottom-4 opacity-5">
            <Hash size={48} />
          </div>
          <div className="text-[10px] text-white/30 font-mono mt-1">Both paid actions & processed</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input 
          type="text"
          placeholder="नाम, ईमेल या UTR सर्च करें..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-black/30 border border-white/10 rounded-xl pl-12 pr-5 py-3.5 outline-none focus:border-accent/40 text-sm font-medium"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">
          <Search size={18} />
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/20">
        {loading ? (
          <div className="p-10 text-center text-white/40">सत्यापन विवरण लोड हो रहा है...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-10 text-center text-white/40 font-serif">कोई सत्यापन रिकॉर्ड नहीं मिला।</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-white/40 bg-white/[0.01]">
                <th className="px-6 py-4">USER / EMAIL</th>
                <th className="px-6 py-4">UTR NUMBER</th>
                <th className="px-6 py-4">AMOUNT</th>
                <th className="px-6 py-4">DATE & TIME</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors text-xs font-mono">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-full bg-white/5 text-white/40">
                        <User size={12} />
                      </div>
                      <div>
                        <div className="font-serif font-semibold text-white/80">{tx.displayName || "यात्री"}</div>
                        <div className="text-[10px] text-white/40 font-mono lower">{tx.userEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-accent font-semibold tracking-wider font-mono">
                    {tx.utr}
                  </td>
                  <td className="px-6 py-4 text-white font-semibold">
                    ₹{tx.amount}
                  </td>
                  <td className="px-6 py-4 text-white/40">
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <Calendar size={10} />
                      {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider ${
                      tx.status === "Success" || tx.status === "Approved"
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : tx.status === "Rejected"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                    }`}>
                      {tx.status === "Success" || tx.status === "Approved" ? (
                        <>Approved</>
                      ) : tx.status === "Rejected" ? (
                        <>Rejected</>
                      ) : (
                        <>Pending</>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      {deletingId === tx.id ? (
                        <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-lg">
                          <span className="text-[9px] uppercase tracking-wider text-red-400 font-semibold">मंजूर? (Sure?)</span>
                          <button
                            onClick={() => handleDeleteTransaction(tx.id)}
                            className="px-2 py-0.5 rounded bg-red-500 hover:bg-red-600 text-black hover:text-white font-bold transition-all text-[9px] uppercase cursor-pointer"
                          >
                            हाँ (Yes)
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="px-2 py-0.5 rounded bg-white/10 text-white/80 hover:bg-white/20 transition-all text-[9px] uppercase cursor-pointer"
                          >
                            नहीं (No)
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(tx.id, "Approved")}
                            className="px-2 py-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-black hover:font-bold transition-all text-[10px] uppercase font-bold cursor-pointer"
                            title="Approve Transaction"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(tx.id, "Rejected")}
                            className="px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-black hover:font-bold transition-all text-[10px] uppercase font-bold cursor-pointer"
                            title="Reject Transaction"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => setDeletingId(tx.id)}
                            className="p-1.5 rounded bg-white/5 text-white/40 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 border border-transparent transition-all cursor-pointer flex items-center justify-center"
                            title="Delete Record"
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
