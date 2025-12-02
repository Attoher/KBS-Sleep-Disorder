// Import components
import './components/Header.js';
import './components/DiagnosisForm.js';
import './components/ResultsPanel.js';
import './components/RuleTester.js';
import './components/Visualization.js';
import './styles/main.css';

class SleepKBSApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.currentTab = 'diagnosis';
    this.results = null;
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .app-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
        }

        .tabs {
          display: flex;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 0.5rem;
          margin-bottom: 2rem;
        }

        .tab-btn {
          flex: 1;
          padding: 1rem 2rem;
          background: none;
          border: none;
          font-family: 'Poppins', sans-serif;
          font-size: 1.1rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .tab-btn:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }

        .tab-btn.active {
          color: white;
          background: rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .tab-content {
          display: none;
        }

        .tab-content.active {
          display: block;
          animation: fadeIn 0.5s ease;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .full-width {
          grid-column: 1 / -1;
        }

        .stats-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin: 1.5rem 0;
        }

        .stat-item {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #4361ee;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #666;
        }

        .footer {
          text-align: center;
          padding: 2rem;
          color: white;
          margin-top: 2rem;
          opacity: 0.8;
        }

        .footer a {
          color: white;
          text-decoration: none;
          margin: 0 0.5rem;
        }

        .footer a:hover {
          text-decoration: underline;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          
          .stats-bar {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .tab-btn {
            padding: 0.75rem 1rem;
            font-size: 1rem;
          }
        }
      </style>

      <div class="app-wrapper">
        <!-- Header -->
        <kbs-header></kbs-header>

        <!-- Tabs -->
        <div class="tabs">
          <button class="tab-btn ${this.currentTab === 'diagnosis' ? 'active' : ''}" data-tab="diagnosis">
            <i class="fas fa-stethoscope"></i> Diagnosis
          </button>
          <button class="tab-btn ${this.currentTab === 'testing' ? 'active' : ''}" data-tab="testing">
            <i class="fas fa-vial"></i> Rule Testing
          </button>
          <button class="tab-btn ${this.currentTab === 'analytics' ? 'active' : ''}" data-tab="analytics">
            <i class="fas fa-chart-line"></i> Analytics
          </button>
          <button class="tab-btn ${this.currentTab === 'about' ? 'active' : ''}" data-tab="about">
            <i class="fas fa-info-circle"></i> About
          </button>
        </div>

        <!-- Tab Contents -->
        <div id="tab-contents">
          <!-- Diagnosis Tab -->
          <div class="tab-content ${this.currentTab === 'diagnosis' ? 'active' : ''}" data-tab="diagnosis">
            <div class="dashboard-grid">
              <diagnosis-form></diagnosis-form>
              <results-panel></results-panel>
            </div>
            <div class="full-width">
              <kbs-visualization></kbs-visualization>
            </div>
          </div>

          <!-- Rule Testing Tab -->
          <div class="tab-content ${this.currentTab === 'testing' ? 'active' : ''}" data-tab="testing">
            <rule-tester></rule-tester>
          </div>

          <!-- Analytics Tab -->
          <div class="tab-content ${this.currentTab === 'analytics' ? 'active' : ''}" data-tab="analytics">
            <div class="card">
              <h2><i class="fas fa-chart-bar"></i> System Analytics</h2>
              <div class="stats-bar" id="analyticsStats"></div>
              <div style="text-align: center; padding: 3rem;">
                <i class="fas fa-chart-pie" style="font-size: 3rem; color: #4361ee; margin-bottom: 1rem;"></i>
                <p>Analytics dashboard coming soon...</p>
              </div>
            </div>
          </div>

          <!-- About Tab -->
          <div class="tab-content ${this.currentTab === 'about' ? 'active' : ''}" data-tab="about">
            <div class="card">
              <h2><i class="fas fa-info-circle"></i> About Sleep Health KBS</h2>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 2rem 0;">
                <div>
                  <h3>System Overview</h3>
                  <p>The Sleep Health Knowledge-Based System is an expert system designed to assist in the diagnosis of sleep disorders, particularly Insomnia and Sleep Apnea.</p>
                  
                  <h3>Features</h3>
                  <ul style="padding-left: 1.5rem; margin: 1rem 0;">
                    <li>20+ expert rules based on clinical guidelines</li>
                    <li>Real-time forward chaining inference engine</li>
                    <li>Neo4j graph database integration</li>
                    <li>Interactive rule testing and validation</li>
                    <li>Comprehensive visualization and reporting</li>
                  </ul>
                </div>
                
                <div>
                  <h3>Technical Stack</h3>
                  <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px;">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                      <div>
                        <strong>Frontend:</strong>
                        <ul style="padding-left: 1rem; margin-top: 0.5rem;">
                          <li>Web Components</li>
                          <li>Chart.js</li>
                          <li>Custom CSS</li>
                        </ul>
                      </div>
                      <div>
                        <strong>Backend:</strong>
                        <ul style="padding-left: 1rem; margin-top: 0.5rem;">
                          <li>Node.js + Express</li>
                          <li>Neo4j Driver</li>
                          <li>Forward Chaining Engine</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <h3>Sources</h3>
                  <p>Based on guidelines from AASM, WHO, and clinical sleep medicine literature.</p>
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #e0e0e0;">
                <p>Version 1.0.0 | Sleep Health KBS &copy; 2024</p>
                <p>For educational and screening purposes only.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>Sleep Health KBS v1.0 | Knowledge-Based System for Sleep Disorder Diagnosis</p>
          <p>&copy; 2024 Final Project | Based on AASM, WHO, and Clinical Guidelines</p>
          <p>
            <a href="#"><i class="fas fa-file-medical"></i> Documentation</a> |
            <a href="#"><i class="fas fa-database"></i> Neo4j Integration</a> |
            <a href="#"><i class="fas fa-code"></i> API</a> |
            <a href="#"><i class="fas fa-github"></i> GitHub</a>
          </p>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // Tab switching
    this.shadowRoot.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Diagnosis form events
    const diagnosisForm = this.shadowRoot.querySelector('diagnosis-form');
    const resultsPanel = this.shadowRoot.querySelector('results-panel');
    const visualization = this.shadowRoot.querySelector('kbs-visualization');

    if (diagnosisForm) {
      diagnosisForm.addEventListener('diagnose', async (e) => {
        const data = e.detail;
        
        // Show loading state
        resultsPanel.setResults(null);
        
        try {
          const response = await fetch('/api/diagnosis/analyze', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });

          const result = await response.json();
          
          if (result.success) {
            this.results = result;
            resultsPanel.setResults(result);
            visualization.setData(result);
            
            // Switch to diagnosis tab if not already there
            if (this.currentTab !== 'diagnosis') {
              this.switchTab('diagnosis');
            }
            
            // Update analytics stats
            this.updateAnalyticsStats();
          } else {
            alert(`Error: ${result.error || 'Failed to process diagnosis'}`);
          }
        } catch (error) {
          alert(`Network error: ${error.message}`);
        }
      });

      diagnosisForm.addEventListener('reset', () => {
        resultsPanel.clearResults();
        visualization.setData(null);
      });
    }
  }

  switchTab(tab) {
    this.currentTab = tab;
    
    // Update active tab button
    this.shadowRoot.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    // Update tab content visibility
    this.shadowRoot.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.dataset.tab === tab);
    });
    
    // Update analytics stats when switching to analytics tab
    if (tab === 'analytics') {
      this.updateAnalyticsStats();
    }
  }

  updateAnalyticsStats() {
    const statsContainer = this.shadowRoot.getElementById('analyticsStats');
    if (!statsContainer) return;

    // Mock analytics data for now
    const stats = [
      { label: 'Total Diagnoses', value: '124', icon: 'fa-users' },
      { label: 'Insomnia Cases', value: '67', icon: 'fa-bed' },
      { label: 'Apnea Cases', value: '42', icon: 'fa-lungs' },
      { label: 'Avg Confidence', value: '78%', icon: 'fa-chart-line' }
    ];

    statsContainer.innerHTML = stats.map(stat => `
      <div class="stat-item">
        <div class="stat-value">${stat.value}</div>
        <div class="stat-label">${stat.label}</div>
        <i class="fas ${stat.icon}" style="color: #4361ee; margin-top: 0.5rem;"></i>
      </div>
    `).join('');
  }
}

// Register the main app component
customElements.define('sleep-kbs-app', SleepKBSApp);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = document.createElement('sleep-kbs-app');
  document.body.appendChild(app);
  
  // Load Font Awesome
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
  document.head.appendChild(link);
  
  // Load Google Fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap';
  document.head.appendChild(fontLink);
  
  // Load Chart.js
  const chartScript = document.createElement('script');
  chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.3.0/dist/chart.umd.min.js';
  document.head.appendChild(chartScript);
});