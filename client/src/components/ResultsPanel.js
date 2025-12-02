class ResultsPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.results = null;
  }

  connectedCallback() {
    this.render();
  }

  setResults(data) {
    this.results = data;
    this.render();
  }

  clearResults() {
    this.results = null;
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          --primary: #4361ee;
          --secondary: #7209b7;
          --success: #2ecc71;
          --warning: #f39c12;
          --danger: #e74c3c;
          --light: #f8f9fa;
          --dark: #2c3e50;
          --gray: #95a5a6;
          --border: #e0e0e0;
          --radius: 12px;
        }

        .card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: var(--radius);
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          height: 100%;
          min-height: 600px;
        }

        h2 {
          font-family: 'Poppins', sans-serif;
          font-size: 1.8rem;
          color: var(--primary);
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        h2 i {
          color: var(--secondary);
        }

        h3 {
          font-family: 'Poppins', sans-serif;
          font-size: 1.4rem;
          color: var(--dark);
          margin: 1.5rem 0 1rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .placeholder {
          text-align: center;
          color: var(--gray);
          padding: 3rem;
        }

        .placeholder i {
          font-size: 3rem;
          margin-bottom: 1rem;
          display: block;
          color: var(--primary);
        }

        .results-container {
          display: none;
        }

        .diagnosis-card {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          padding: 2rem;
          border-radius: var(--radius);
          margin-bottom: 1.5rem;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(67, 97, 238, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(67, 97, 238, 0); }
          100% { box-shadow: 0 0 0 0 rgba(67, 97, 238, 0); }
        }

        .diagnosis-card h3 {
          font-size: 1.8rem;
          margin-bottom: 1rem;
          color: white;
        }

        .risk-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
          margin: 0.5rem;
          font-size: 0.9rem;
        }

        .risk-high { background: var(--danger); color: white; }
        .risk-moderate { background: var(--warning); color: white; }
        .risk-low { background: var(--success); color: white; }

        .lifestyle-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin: 1rem 0;
        }

        .lifestyle-item {
          background: var(--light);
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .lifestyle-item.detected {
          border-color: var(--danger);
          background: rgba(231, 76, 60, 0.1);
        }

        .lifestyle-item i {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          display: block;
        }

        .lifestyle-item.detected i {
          color: var(--danger);
        }

        .lifestyle-item:not(.detected) i {
          color: var(--success);
        }

        .recommendation-list {
          list-style: none;
        }

        .recommendation-list li {
          padding: 1rem;
          background: var(--light);
          margin-bottom: 0.5rem;
          border-radius: 8px;
          border-left: 4px solid var(--primary);
          display: flex;
          align-items: start;
          gap: 1rem;
          transition: transform 0.3s ease;
        }

        .recommendation-list li:hover {
          transform: translateX(5px);
        }

        .recommendation-list i {
          color: var(--success);
          margin-top: 0.25rem;
        }

        .rules-fired {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin: 1rem 0;
        }

        .rule-badge {
          background: var(--primary);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.9rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .confidence-meter {
          background: var(--light);
          padding: 1rem;
          border-radius: 8px;
          margin: 1rem 0;
        }

        .confidence-bar {
          height: 10px;
          background: linear-gradient(to right, var(--danger), var(--warning), var(--success));
          border-radius: 5px;
          margin: 0.5rem 0;
          position: relative;
          overflow: hidden;
        }

        .confidence-fill {
          height: 100%;
          background: var(--primary);
          border-radius: 5px;
          transition: width 1s ease;
        }

        .confidence-value {
          font-weight: 600;
          color: var(--primary);
          font-size: 1.2rem;
        }

        .explanation {
          background: var(--light);
          padding: 1rem;
          border-radius: 8px;
          margin: 1rem 0;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .explanation p {
          margin: 0.5rem 0;
          padding-left: 1rem;
          position: relative;
        }

        .explanation p:before {
          content: "•";
          color: var(--primary);
          position: absolute;
          left: 0;
        }

        @media (max-width: 768px) {
          .lifestyle-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>

      <div class="card">
        <h2><i class="fas fa-chart-bar"></i> Diagnosis Results</h2>
        
        ${this.results ? `
          <div class="results-container" style="display: block;">
            <div class="diagnosis-card">
              <h3><i class="fas fa-diagnoses"></i> ${this.results.diagnosis}</h3>
              <div class="risk-badges" id="riskBadges"></div>
            </div>

            <h3><i class="fas fa-exclamation-triangle"></i> Lifestyle Issues</h3>
            <div class="lifestyle-grid" id="lifestyleIssues"></div>

            <h3><i class="fas fa-lightbulb"></i> Recommendations</h3>
            <ul class="recommendation-list" id="recommendations"></ul>

            <h3><i class="fas fa-cogs"></i> Rules Fired</h3>
            <div class="rules-fired" id="firedRules"></div>

            <h3><i class="fas fa-chart-line"></i> Confidence Level</h3>
            <div class="confidence-meter">
              <div class="confidence-bar">
                <div class="confidence-fill" id="confidenceFill"></div>
              </div>
              <div class="confidence-value" id="confidenceValue"></div>
            </div>

            <h3><i class="fas fa-info-circle"></i> Explanation</h3>
            <div class="explanation" id="explanation"></div>
          </div>
        ` : `
          <div class="placeholder">
            <i class="fas fa-stethoscope"></i>
            <p>Enter patient data and click "Run Diagnosis" to see results</p>
          </div>
        `}
      </div>
    `;

    if (this.results) {
      this.updateResults();
    }
  }

  updateResults() {
    // Update risk badges
    const riskBadges = this.shadowRoot.getElementById('riskBadges');
    if (this.results.results.risks.insomnia) {
      const badge = document.createElement('span');
      badge.className = `risk-badge risk-${this.results.results.risks.insomnia}`;
      badge.textContent = `Insomnia: ${this.results.results.risks.insomnia.toUpperCase()}`;
      riskBadges.appendChild(badge);
    }
    
    if (this.results.results.risks.apnea) {
      const badge = document.createElement('span');
      badge.className = `risk-badge risk-${this.results.results.apnea}`;
      badge.textContent = `Apnea: ${this.results.results.risks.apnea.toUpperCase()}`;
      riskBadges.appendChild(badge);
    }

    // Update lifestyle issues
    const lifestyleGrid = this.shadowRoot.getElementById('lifestyleIssues');
    const lifestyleData = [
      { key: 'sleep', label: 'Sleep Issue', icon: 'fa-bed', detected: this.results.results.lifestyleIssues.sleep },
      { key: 'stress', label: 'Stress Issue', icon: 'fa-brain', detected: this.results.results.lifestyleIssues.stress },
      { key: 'activity', label: 'Activity Issue', icon: 'fa-running', detected: this.results.results.lifestyleIssues.activity },
      { key: 'weight', label: 'Weight Issue', icon: 'fa-weight-scale', detected: this.results.results.lifestyleIssues.weight }
    ];

    lifestyleData.forEach(item => {
      const div = document.createElement('div');
      div.className = `lifestyle-item ${item.detected ? 'detected' : ''}`;
      div.innerHTML = `
        <i class="fas ${item.icon}"></i>
        <div>${item.label}</div>
        <small>${item.detected ? 'Detected' : 'Normal'}</small>
      `;
      lifestyleGrid.appendChild(div);
    });

    // Update recommendations
    const recommendations = this.shadowRoot.getElementById('recommendations');
    this.results.results.recommendations.forEach(rec => {
      const li = document.createElement('li');
      li.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <div>
          <strong>${rec.title}</strong><br>
          <small>${rec.description}</small>
        </div>
      `;
      recommendations.appendChild(li);
    });

    // Update fired rules
    const firedRules = this.shadowRoot.getElementById('firedRules');
    this.results.rules.fired.forEach(ruleId => {
      const badge = document.createElement('span');
      badge.className = 'rule-badge';
      badge.innerHTML = `<i class="fas fa-bolt"></i> ${ruleId}`;
      firedRules.appendChild(badge);
    });

    // Update confidence
    const confidenceFill = this.shadowRoot.getElementById('confidenceFill');
    const confidenceValue = this.shadowRoot.getElementById('confidenceValue');
    const confidence = this.results.results.confidence || 75;
    
    setTimeout(() => {
      confidenceFill.style.width = `${confidence}%`;
      confidenceValue.textContent = `${confidence}% Confidence`;
    }, 100);

    // Update explanation
    const explanation = this.shadowRoot.getElementById('explanation');
    if (this.results.explanation && Array.isArray(this.results.explanation)) {
      this.results.explanation.forEach(text => {
        const p = document.createElement('p');
        p.textContent = text;
        explanation.appendChild(p);
      });
    }
  }
}

customElements.define('results-panel', ResultsPanel);