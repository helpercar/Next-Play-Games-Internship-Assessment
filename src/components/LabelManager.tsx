import React, { useState } from 'react';
import { Plus, X, Pipette } from 'lucide-react'; // Injected Pipette icon
import { supabase } from '../supabaseClient';
import type { Label } from '../types';

interface LabelManagerProps {
  onLabelAdded: (newLabel: Label) => void;
}

// Some Default COlors
const PALETTE_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', 
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', 
  '#ec4899', '#71717a'
];

export const LabelManager: React.FC<LabelManagerProps> = ({ onLabelAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#6366f1'); // Stores current hex string
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || submitting) return;

    setSubmitting(true);
    
    const { data, error } = await supabase
      .from('labels')
      .insert([{ name: name.trim(), color: selectedColor }])
      .select()
      .single();

    setSubmitting(false);

    // Error handling just in case
    if (!error && data) {
      onLabelAdded(data as Label);
      setName('');
      setIsOpen(false);
    } else if (error) {
      console.error('Failed to save custom label:', error.message);
    }
  };

return (
    <div className="relative inline-block ml-auto">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 py-1 rounded-md text-xs font-medium border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-all flex items-center gap-1 cursor-pointer shrink-0"
      >
        <Plus size={12} /> Add Tag
      </button>

      {/* Floating Tooltip Input Dialog Form Popover */}
      {isOpen && (
        <div className="absolute right-0 top-10 z-50 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-4 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Create Custom Tag</span>
            <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-zinc-300 cursor-pointer">
              <X size={12} />
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-3">
            <input
              type="text"
              placeholder="Tag name (e.g. Core, Refactor)..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="w-full bg-zinc-950 text-zinc-200 border border-zinc-800 text-xs rounded-lg p-2 outline-none focus:border-indigo-500 placeholder-zinc-600"
            />

            {/* Color Palette Sections Grouping Block */}
            <div className="space-y-3">
              <div>
                <label className="block text-[9px] uppercase font-bold text-zinc-500 tracking-wider mb-1.5">Preset Colors</label>
                <div className="flex flex-wrap gap-1.5 items-center">
                  {PALETTE_COLORS.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setSelectedColor(hex)}
                      className={`h-5 w-5 rounded-full border cursor-pointer transition-all hover:scale-110 shrink-0 ${
                        selectedColor === hex ? 'border-white scale-105' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>

              {/* Custom Color Field Layer */}
              <div className="pt-2 flex items-center justify-between border-t border-zinc-800/60 mt-1">
                <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1 text-zinc-400">
                  <Pipette size={10} /> Custom Shade
                </span>
                
                <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg p-1 px-1.5 max-w-[90px]">
                  {/* Hex Text Indicator */}
                  <span className="text-[9px] font-mono text-zinc-400 uppercase select-all tracking-tight truncate w-12">
                    {selectedColor}
                  </span>
                  
                  {/* Visual Color Input Square Block */}
                  <input 
                    type="color" 
                    value={selectedColor} 
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-4 h-4 rounded-md border-0 bg-transparent cursor-pointer outline-none overflow-hidden shrink-0"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs shadow-sm transition-all cursor-pointer"
            >
              {submitting ? 'Saving...' : 'Save Tag'}
            </button>
          </form>
        </div>
      )}
    </div>
  );

};
