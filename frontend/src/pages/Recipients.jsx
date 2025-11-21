import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, User, Edit2 } from 'lucide-react';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import api from '../services/api';

const Recipients = () => {
  const [recipients, setRecipients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRecipient, setNewRecipient] = useState({ name: '', walletAddress: '' });
  const [loading, setLoading] = useState(false);

  // Fetch logic would go here (using useEffect)
  useEffect(() => {
    // Mock data
    setRecipients([
      { id: 1, name: 'Mom', walletAddress: '8xrt...9jKs' },
      { id: 2, name: 'Bae', walletAddress: 'Cb4...Lm90' }
    ]);
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // await api.post('/users/recipients', newRecipient);
      setRecipients([...recipients, { ...newRecipient, id: Date.now() }]);
      setIsModalOpen(false);
      setNewRecipient({ name: '', walletAddress: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-3xl pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-white/5 rounded-full text-light-muted hover:text-white transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-white">Recipients</h1>
        </div>
        <Button size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Add New
        </Button>
      </div>

      <div className="grid gap-3 md:gap-4">
        {recipients.map((recipient) => (
          <div key={recipient.id} className="bg-dark-surface border border-dark-border p-4 rounded-xl flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-white font-bold">
                {recipient.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-white">{recipient.name}</p>
                <p className="text-xs text-light-muted font-mono">{recipient.walletAddress}</p>
              </div>
            </div>
            <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
               <button className="p-2 text-light-muted hover:text-white hover:bg-white/10 rounded-lg">
                 <Edit2 size={16} />
               </button>
               <button className="p-2 text-error hover:bg-error/10 rounded-lg">
                 <Trash2 size={16} />
               </button>
            </div>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New Recipient"
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <Input 
            label="Name" 
            placeholder="e.g. Mom" 
            value={newRecipient.name}
            onChange={(e) => setNewRecipient({...newRecipient, name: e.target.value})}
            icon={User}
          />
          <Input 
            label="Wallet Address" 
            placeholder="Solana Address" 
            value={newRecipient.walletAddress}
            onChange={(e) => setNewRecipient({...newRecipient, walletAddress: e.target.value})}
          />
          <div className="pt-4">
            <Button type="submit" size="full" isLoading={loading}>Save Recipient</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Recipients;