import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Book, FileText, Search, Loader2 } from 'lucide-react';

export const ConfluenceView = ({ activeWorkspace, activeCustomBoardId, activeCustomBoardTitle, setFilterProject }) => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5001";
      const res = await axios.get(`${apiBase}/confluence/pages`);
      setPages(res.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load Confluence pages. Ensure your Atlassian API tokens are correctly configured.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPages = pages.filter(p => p.title?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="fade-in" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Book color="var(--primary)" /> Project Wiki & Docs
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
            Browse architecture documents, sprint retrospectives, and project requirements directly from Confluence.
          </p>
        </div>
        
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search pages..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-muted)' }}>
          <Loader2 className="spin" size={32} style={{ marginBottom: '16px', color: 'var(--primary)' }} />
          <p>Syncing with Confluence Cloud...</p>
        </div>
      ) : error ? (
        <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          {error}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filteredPages.length > 0 ? filteredPages.map(page => (
            <a 
              key={page.id} 
              href={page._links?.base + page._links?.webui}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <div style={{ 
                padding: '20px', 
                background: 'var(--bg-card)', 
                borderRadius: '12px', 
                border: '1px solid var(--border-subtle)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                transition: 'all 0.2s',
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText color="var(--primary)" size={20} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>{page.title}</h3>
                </div>
                <div style={{ marginTop: 'auto', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Status: {page.status || 'current'} • ID: {page.id}
                </div>
              </div>
            </a>
          )) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: '12px', border: '1px dashed var(--border-subtle)' }}>
              No pages found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
