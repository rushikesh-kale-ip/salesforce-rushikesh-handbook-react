import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { FileText, ChevronLeft, ChevronRight, Menu, X, ChevronDown, BookOpen, Code, Zap, Search, Palette } from 'lucide-react';
import './LearningRoute.css';

// ─── Topics Data ────────────────────────────────────────────────────────────
const topicsData = [
  { id: '01_salesforce_architecture',    name: 'Salesforce Architecture',       description: 'Multitenancy, metadata, governor limits & environments', icon: Code },
  { id: '02_data_model',                 name: 'Data Model',                    description: 'Objects, fields, relationships & record types',          icon: Code },
  { id: '03_apex_basics',                name: 'Apex Basics',                   description: 'Variables, collections, methods & access modifiers',     icon: Code },
  { id: '04_soql_sosl',                  name: 'SOQL & SOSL',                   description: 'Queries, relationships, aggregates & dynamic SOQL',      icon: Code },
  { id: '05_triggers',                   name: 'Triggers',                      description: 'Trigger syntax, context variables & frameworks',         icon: Code },
  { id: '06_order_of_execution',         name: 'Order of Execution',            description: 'Save order, trigger & flow interaction',                 icon: Code },
  { id: '07_asynchronous_apex',          name: 'Asynchronous Apex',             description: 'Future, Queueable, Batch & Scheduled Apex',              icon: Code },
  { id: '08_advanced_apex',              name: 'Advanced Apex',                 description: 'DML methods, savepoints, mixed DML & dynamic Apex',      icon: Code },
  { id: '09_configuration_support',      name: 'Configuration Support',         description: 'Custom metadata, custom settings & custom labels',       icon: Code },
  { id: '10_testing',                    name: 'Testing',                       description: 'Test classes, async testing, mocking & data strategies', icon: Code },
  { id: '11_lightning_web_components',   name: 'Lightning Web Components',      description: 'LWC architecture, decorators, lifecycle & performance',  icon: Code },
  { id: '12_aura_framework',             name: 'Aura Framework',                description: 'Component structure, events & communication model',     icon: Code },
  { id: '13_visualforce',                name: 'Visualforce',                   description: 'Controllers, extensions, view state & VF vs Lightning',  icon: Code },
  { id: '14_flow',                       name: 'Flow',                          description: 'Record-triggered, screen & autolaunched flows',          icon: Code },
  { id: '15_legacy_automation',          name: 'Legacy Automation',             description: 'Workflow rules, Process Builder & approval processes',   icon: Code },
  { id: '16_api_fundamentals',           name: 'API Fundamentals',              description: 'REST API, SOAP API & Apex REST',                         icon: Code },
  { id: '17_callouts',                   name: 'Callouts',                      description: 'HTTP callouts, named credentials, OAuth & retry',        icon: Code },
  { id: '18_event_based_integration',    name: 'Event-Based Integration',       description: 'Platform Events, Change Data Capture & ReplayId',        icon: Code },
  { id: '19_integration_design_patterns',name: 'Integration Design Patterns',   description: 'Request-response, fire & forget & middleware patterns',  icon: Code },
  { id: '20_object_and_field_security',  name: 'Object & Field Security',       description: 'OWD, role hierarchy, sharing rules & FLS enforcement',   icon: Code },
  { id: '21_user_management',            name: 'User Management',               description: 'Profiles, permission sets & external user licenses',     icon: Code },
  { id: '22_experience_cloud_architecture', name: 'Experience Cloud Architecture', description: 'Community types, licenses & partner role structure', icon: Code },
  { id: '23_external_data_access',       name: 'External Data Access',          description: 'Sharing sets, share groups & guest user security',       icon: Code },
  { id: '24_customization',              name: 'Experience Cloud Customization', description: 'Experience Builder, CMS, login flows & self registration', icon: Code },
  { id: '25_salesforce_sites',           name: 'Salesforce Sites',              description: 'Public access settings, guest user security & page access', icon: Code },
  { id: '26_deployment_methods',         name: 'Deployment Methods',            description: 'Change sets, SFDX, Metadata API & packages',             icon: Code },
  { id: '27_ci_cd',                      name: 'CI/CD',                         description: 'Version control & pipeline basics',                      icon: Code },
  { id: '28_large_data_volume',          name: 'Large Data Volume',             description: 'Selective queries, indexes, skinny tables & query plan', icon: Code },
  { id: '29_scenario_based_questions',   name: 'Scenario-Based Questions',      description: 'Real-world enterprise scenarios & debugging challenges',  icon: Code },
  { id: '30_project_level_discussion',   name: 'Project-Level Discussion',      description: 'Architecture, integration, deployment & production strategies', icon: Code },
];

// ─── Session Storage Helpers ─────────────────────────────────────────────────
const SS = {
  get: (key, fallback = null) => {
    try { const v = sessionStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set: (key, val) => {
    try { sessionStorage.setItem(key, JSON.stringify(val)); } catch {}
  },
};

// ─── File Cache (in-memory, rebuilt on refresh from session) ─────────────────
const fileCache = new Map();

const loadFiles = async (topicId) => {
  if (fileCache.has(topicId)) return fileCache.get(topicId);
  try {
    const res = await fetch(`/salesforce-dev-handbook-react/content/${topicId}/manifest.json`);
    if (!res.ok) return [];
    const fileList = await res.json();
    const files = await Promise.all(
      fileList.map(async (fileName) => {
        const match = fileName.match(/^(\d+)_(.+)\.(md|html|pdf|jpg|jpeg|png|webp|txt)$/);
        if (!match) return null;
        const rank = parseInt(match[1]);
        const name = match[2].replace(/_/g, ' ');
        const type = match[3];
        if (['pdf', 'jpg', 'jpeg', 'png', 'webp'].includes(type)) {
          return { rank, name, type, content: `/salesforce-dev-handbook-react/content/${topicId}/${fileName}` };
        }
        const fileRes = await fetch(`/salesforce-dev-handbook-react/content/${topicId}/${fileName}`);
        const content = await fileRes.text();
        return { rank, name, type, content };
      })
    );
    const sorted = files.filter(Boolean).sort((a, b) => a.rank - b.rank);
    fileCache.set(topicId, sorted);
    return sorted;
  } catch { return []; }
};

// ─── Home Screen – 30 Topic Cards ────────────────────────────────────────────
const HomeScreen = ({ onTopicSelect }) => {
  const PART_COLORS = [
    '#0A84FF', '#0A84FF',                           // Part 1 – Fundamentals
    '#5E5CE6', '#5E5CE6', '#5E5CE6', '#5E5CE6',
    '#5E5CE6', '#5E5CE6', '#5E5CE6', '#5E5CE6',    // Part 2 – Apex
    '#BF5AF2', '#BF5AF2', '#BF5AF2',               // Part 3 – UI
    '#FF9F0A', '#FF9F0A',                           // Part 4 – Automation
    '#30D158', '#30D158', '#30D158', '#30D158',    // Part 5 – Integration
    '#FF453A', '#FF453A',                           // Part 6 – Security
    '#FF9F0A', '#FF9F0A', '#FF9F0A',               // Part 7 – Experience Cloud
    '#64D2FF',                                      // Part 8 – Sites
    '#0A84FF', '#0A84FF',                           // Part 9 – DevOps
    '#30D158',                                      // Part 10 – LDV
    '#FF6B6B', '#FF6B6B',                           // Part 11 – Scenarios
  ];

  const PART_LABELS = [
    'Fundamentals', 'Fundamentals',
    'Apex', 'Apex', 'Apex', 'Apex', 'Apex', 'Apex', 'Apex', 'Apex',
    'UI Dev', 'UI Dev', 'UI Dev',
    'Automation', 'Automation',
    'Integration', 'Integration', 'Integration', 'Integration',
    'Security', 'Security',
    'Experience', 'Experience', 'Experience',
    'Sites',
    'DevOps', 'DevOps',
    'Performance',
    'Scenarios', 'Scenarios',
  ];

  return (
    <div className="home-screen">
      <div className="home-hero">
        <div className="home-hero-icon">📘</div>
        <h1 className="home-hero-title">Salesforce Developer Guide</h1>
        <p className="home-hero-sub">30 topics · Interview ready · Production patterns</p>
      </div>

      <div className="topics-grid">
        {topicsData.map((topic, idx) => (
          <button
            key={topic.id}
            className="topic-grid-card"
            onClick={() => onTopicSelect(topic.id)}
            style={{ '--accent': PART_COLORS[idx] }}
          >
            <div className="tgc-number">{String(idx + 1).padStart(2, '0')}</div>
            <div className="tgc-accent-bar" />
            <div className="tgc-body">
              <div className="tgc-label">{PART_LABELS[idx]}</div>
              <div className="tgc-name">{topic.name}</div>
              <div className="tgc-desc">{topic.description}</div>
            </div>
            <div className="tgc-arrow">→</div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Topic Card (Sidebar) ────────────────────────────────────────────────────
const TopicCard = memo(({ topic, isActive, isExpanded, files, onTopicClick, onFileClick, currentFileIndex, selectedTopic }) => {
  const Icon = topic.icon;
  const containerRef = useRef(null);

  // Scroll this topic to the top of the sidebar when it becomes active
  useEffect(() => {
    if (isActive && containerRef.current) {
      // Small delay so expansion animation doesn't fight the scroll
      setTimeout(() => {
        containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  }, [isActive]);

  return (
    <div className="topic-container" ref={containerRef}>
      {isExpanded && files.length > 0 && (
        <div className="topic-connector" style={{ height: `${files.length * 3}rem` }} />
      )}
      <div onClick={() => onTopicClick(topic.id)} className={`topic-card ${isActive ? 'active' : ''}`}>
        <div className="topic-content">
          <div className="topic-icon-wrapper"><Icon size={18} /></div>
          <div className="topic-details">
            <h3 className="topic-title">
              <span className="topic-name">{topic.name}</span>
              <div className={`chevron-icon ${isExpanded ? 'expanded' : ''}`}><ChevronDown size={14} /></div>
            </h3>
            <p className="topic-description">{topic.description}</p>
          </div>
        </div>
        {!isActive && <div className="topic-hover-effect" />}
      </div>
      {isExpanded && files.length > 0 && (
        <div className="files-list">
          {files.map((file, index) => {
            const isFileActive = currentFileIndex === index && selectedTopic === topic.id;
            return (
              <div key={index} className="file-item-wrapper">
                <div className="file-connector-line" />
                <div className="file-connector-dot"><Zap size={8} fill="currentColor" /></div>
                <div onClick={(e) => { e.stopPropagation(); onFileClick(index); }} className={`file-item ${isFileActive ? 'active' : ''}`}>
                  <span className="file-rank">{file.rank}</span>
                  <span className="file-name">{file.name}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

// ─── Content Renderer ────────────────────────────────────────────────────────
const ContentRenderer = memo(({ content, type }) => {
  if (type === 'html') return <div className="html-content" dangerouslySetInnerHTML={{ __html: content }} />;
  if (type === 'md') {
    return (
      <div className="markdown-content">
        {content.split('\n').map((line, i) => {
          if (line.startsWith('# '))   return <h1 key={i} className="md-h1">{line.substring(2)}</h1>;
          if (line.startsWith('## '))  return <h2 key={i} className="md-h2">{line.substring(3)}</h2>;
          if (line.startsWith('### ')) return <h3 key={i} className="md-h3">{line.substring(4)}</h3>;
          if (line.startsWith('- '))   return <li key={i} className="md-li">{line.substring(2)}</li>;
          if (line.trim() === '')      return <div key={i} className="md-spacer" />;
          if (line.includes('**')) {
            const parts = line.split('**');
            return <p key={i} className="md-p">{parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}</p>;
          }
          return <p key={i} className="md-p">{line}</p>;
        })}
      </div>
    );
  }
  if (type === 'pdf') return <div className="pdf-viewer"><iframe src={content} className="pdf-iframe" title="PDF" loading="lazy" /></div>;
  if (['jpg','jpeg','png','webp'].includes(type)) return <div className="image-viewer"><img src={content} alt="Content" className="content-image" loading="lazy" /></div>;
  if (type === 'txt') return <div className="text-content"><pre className="text-pre">{content}</pre></div>;
  return <div>{content}</div>;
});

// ─── Main Component ──────────────────────────────────────────────────────────
const LearningRoute = () => {
  // Restore from session storage
  const [selectedTopic,   setSelectedTopic]   = useState(() => SS.get('lr_topic', null));
  const [currentFileIndex,setCurrentFileIndex] = useState(() => SS.get('lr_fileIdx', null));
  const [expandedTopics,  setExpandedTopics]   = useState(() => SS.get('lr_expanded', {}));
  const [backgroundTheme, setBackgroundTheme]  = useState(() => SS.get('lr_theme', 'blue'));

  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [files,        setFiles]        = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [filteredTopics, setFilteredTopics] = useState(topicsData);
  // null = home screen, else we are in reader mode
  const [view, setView] = useState(() => SS.get('lr_topic', null) ? 'reader' : 'home');

  const contentTopRef = useRef(null);

  // ── Persist state to sessionStorage ────────────────────────────────────────
  useEffect(() => { SS.set('lr_topic',    selectedTopic);   }, [selectedTopic]);
  useEffect(() => { SS.set('lr_fileIdx',  currentFileIndex);}, [currentFileIndex]);
  useEffect(() => { SS.set('lr_expanded', expandedTopics);  }, [expandedTopics]);
  useEffect(() => { SS.set('lr_theme',    backgroundTheme); }, [backgroundTheme]);
  useEffect(() => { SS.set('lr_view',     view);            }, [view]);

  // ── Restore files on mount if topic was persisted ──────────────────────────
  useEffect(() => {
    if (selectedTopic && view === 'reader') {
      setLoading(true);
      loadFiles(selectedTopic).then(f => {
        setFiles(f);
        setLoading(false);
      });
    }
  }, []); // eslint-disable-line

  // ── Debounced search ───────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      if (!searchQuery.trim()) { setFilteredTopics(topicsData); return; }
      setFilteredTopics(topicsData.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const scrollToTop = useCallback(() => {
    if (contentTopRef.current) {
      const offset = contentTopRef.current.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  }, []);

  // ── Home screen topic select ───────────────────────────────────────────────
  const handleHomeTopicSelect = useCallback(async (topicId) => {
    setView('reader');
    setLoading(true);
    const topicFiles = await loadFiles(topicId);
    setFiles(topicFiles);
    setSelectedTopic(topicId);
    setCurrentFileIndex(topicFiles.length > 0 ? 0 : null);
    setExpandedTopics(prev => ({ ...prev, [topicId]: true }));
    setLoading(false);
    setTimeout(scrollToTop, 100);
  }, [scrollToTop]);

  // ── Sidebar topic click ────────────────────────────────────────────────────
  const handleTopicClick = useCallback(async (topicId) => {
    const isExpanded  = expandedTopics[topicId];
    const isNewTopic  = selectedTopic !== topicId;

    if (isNewTopic || isExpanded) {
      setExpandedTopics(prev => ({ ...prev, [topicId]: !prev[topicId] }));
    }

    if (isNewTopic || !isExpanded) {
      setLoading(true);
      const topicFiles = await loadFiles(topicId);
      setFiles(topicFiles);
      setSelectedTopic(topicId);
      setCurrentFileIndex(topicFiles.length > 0 ? 0 : null);
      setLoading(false);
      setExpandedTopics(prev => ({ ...prev, [topicId]: true }));
      setTimeout(scrollToTop, 100);
    }
  }, [expandedTopics, selectedTopic, scrollToTop]);

  const handleFileClick = useCallback((index) => {
    setCurrentFileIndex(index);
    setSidebarOpen(false);
    setTimeout(scrollToTop, 100);
  }, [scrollToTop]);

  const handleNext = useCallback(() => {
    if (currentFileIndex < files.length - 1) {
      setCurrentFileIndex(i => i + 1);
      setTimeout(scrollToTop, 100);
    }
  }, [currentFileIndex, files.length, scrollToTop]);

  const handlePrev = useCallback(() => {
    if (currentFileIndex > 0) {
      setCurrentFileIndex(i => i - 1);
      setTimeout(scrollToTop, 100);
    }
  }, [currentFileIndex, scrollToTop]);

  const toggleTheme = useCallback(() => {
    setBackgroundTheme(p => p === 'blue' ? 'orange' : 'blue');
  }, []);

  const goHome = useCallback(() => {
    setView('home');
    SS.set('lr_view', 'home');
  }, []);

  const currentFile      = currentFileIndex !== null ? files[currentFileIndex] : null;
  const currentTopicData = topicsData.find(t => t.id === selectedTopic);

  return (
    <div className={`learning-container theme-${backgroundTheme}`}>
      <div className={`background-image ${backgroundTheme === 'blue' ? 'bg-blue' : 'bg-orange'}`} />

      {/* ── Header ── */}
      <header className="header">
        <div className="header-container">
          <div className="header-left">
            {view === 'reader' && (
              <button onClick={() => setSidebarOpen(o => !o)} className="mac-btn mobile-only" aria-label="Toggle menu">
                {sidebarOpen ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
              </button>
            )}
            <button onClick={goHome} className="mac-app-icon" aria-label="Go home">
              <BookOpen size={20} strokeWidth={2} />
            </button>
            <div className="header-text">
              <h1 className="header-title">My Learning Journey</h1>
              <p className="header-subtitle">Continuous growth through experience</p>
            </div>
          </div>
          <button onClick={toggleTheme} className="mac-btn mac-btn--accent" title="Toggle theme" aria-label="Toggle theme">
            <Palette size={18} strokeWidth={2} />
          </button>
        </div>
      </header>

      {/* ── Home View ── */}
      {view === 'home' && (
        <div className="content-wrapper">
          <HomeScreen onTopicSelect={handleHomeTopicSelect} />
        </div>
      )}

      {/* ── Reader View ── */}
      {view === 'reader' && (
        <div className="content-wrapper">
          <div className="content-grid">

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
              <div className="sidebar-content">
                <div className="search-container">
                  <div className="search-wrapper">
                    <Search className="search-icon" size={18} />
                    <input
                      type="text"
                      placeholder="Search topics..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="search-input"
                      aria-label="Search topics"
                    />
                  </div>
                  {searchQuery && <p className="search-results">Found {filteredTopics.length} topic(s)</p>}
                </div>

                <h2 className="sidebar-title">Topics</h2>

                <div className="topics-list">
                  {filteredTopics.length > 0 ? filteredTopics.map(topic => (
                    <TopicCard
                      key={topic.id}
                      topic={topic}
                      isActive={selectedTopic === topic.id}
                      isExpanded={expandedTopics[topic.id]}
                      files={selectedTopic === topic.id ? files : []}
                      onTopicClick={handleTopicClick}
                      onFileClick={handleFileClick}
                      currentFileIndex={currentFileIndex}
                      selectedTopic={selectedTopic}
                    />
                  )) : (
                    <div className="no-results">
                      <Search size={48} className="no-results-icon" />
                      <p className="no-results-text">No topics found</p>
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="sidebar-overlay" />}

            {/* Main Content */}
            <main className="main-content">
              <div ref={contentTopRef} className="content-card">
                {loading ? (
                  <div className="loading-container">
                    <div className="loading-icon">
                      <div className="spinner"><BookOpen size={64} /></div>
                    </div>
                    <p className="loading-text">Loading content...</p>
                  </div>
                ) : currentFile && currentTopicData ? (
                  <>
                    <div className="breadcrumb">
                      <div className="breadcrumb-path">
                        <BookOpen size={14} />
                        <span className="breadcrumb-topic">{currentTopicData.name}</span>
                        <ChevronRight size={14} />
                        <span className="breadcrumb-file">{currentFile.name}</span>
                      </div>
                    </div>

                    <div className="content-body">
                      <ContentRenderer content={currentFile.content} type={currentFile.type} />
                    </div>

                    <div className="navigation">
                      <button onClick={handlePrev} disabled={currentFileIndex === 0 || files.length <= 1} className="nav-button prev" aria-label="Previous">
                        <ChevronLeft size={18} /><span className="nav-text">Previous</span>
                      </button>
                      <div className="page-indicator">
                        <span className="page-number">{currentFileIndex + 1} / {files.length}</span>
                      </div>
                      <button onClick={handleNext} disabled={currentFileIndex === files.length - 1 || files.length <= 1} className="nav-button next" aria-label="Next">
                        <span className="nav-text">Next</span><ChevronRight size={18} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="welcome-container">
                    <div className="welcome-icon"><FileText size={64} /></div>
                    <h3 className="welcome-title">Welcome to My Learning Journey</h3>
                    <p className="welcome-text">Select a topic from the sidebar to begin exploring</p>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningRoute;