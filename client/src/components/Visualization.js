class Visualization extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.chart = null;
    this.data = null;
  }

  connectedCallback() {
    this.render();
  }

  setData(data) {
    this.data = data;
    this.render();
    if (this.data) {
      this.createCharts();
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          --primary: #4361ee;
          --secondary: #7209b7;
          --light: #f8f9fa;
          --dark: #2c3e50;
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
        }

        .placeholder {
          text-align: center;
          color: #95a5a6;
          padding: 3rem;
        }

        .placeholder i {
          font-size: 3rem;
          margin-bottom: 1rem;
          display: block;
          color: var(--primary);
        }

        .charts-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          margin-top: 1.5rem;
        }

        .chart-card {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .chart-wrapper {
          position: relative;
          height: 300px;
          width: 100%;
        }

        canvas {
          max-width: 100%;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin: 1.5rem 0;
        }

        .metric-card {
          background: var(--light);
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          border-left: 4px solid var(--primary);
        }

        .metric-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 0.5rem;
        }

        .metric-label {
          font-size: 0.9rem;
          color: #666;
        }

        .risk-indicators {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin: 1rem 0;
        }

        .risk-indicator {
          text-align: center;
        }

        .risk-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 0.5rem;
          font-weight: 700;
          font-size: 1.2rem;
          color: white;
        }

        .risk-high { background: linear-gradient(135deg, #e74c3c, #c0392b); }
        .risk-moderate { background: linear-gradient(135deg, #f39c12, #d35400); }
        .risk-low { background: linear-gradient(135deg, #2ecc71, #27ae60); }

        .timeline {
          position: relative;
          padding: 2rem 0;
        }

        .timeline-item {
          position: relative;
          padding-left: 2rem;
          margin-bottom: 1.5rem;
        }

        .timeline-item:before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--primary);
        }

        .timeline-item:after {
          content: '';
          position: absolute;
          left: 5px;
          top: 12px;
          width: 2px;
          height: calc(100% + 1.5rem);
          background: var(--border);
        }

        .timeline-item:last-child:after {
          display: none;
        }

        .timeline-title {
          font-weight: 600;
          color: var(--dark);
          margin-bottom: 0.25rem;
        }

        .timeline-desc {
          font-size: 0.9rem;
          color: #666;
        }

        @media (max-width: 768px) {
          .charts-container {
            grid-template-columns: 1fr;
          }
          
          .risk-indicators {
            flex-direction: column;
            gap: 1rem;
          }
        }
      </style>

      <div class="card">
        <h2><i class="fas fa-chart-pie"></i> Analysis & Visualization</h2>
        
        ${this.data ? `
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-value">${this.data.results.confidence || 75}%</div>
              <div class="metric-label">Confidence Level</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${this.data.rules.fired.length}</div>
              <div class="metric-label">Rules Activated</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${this.data.results.recommendations.length}</div>
              <div class="metric-label">Recommendations</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${Object.values(this.data.results.lifestyleIssues).filter(v => v).length}</div>
              <div class="metric-label">Lifestyle Issues</div>
            </div>
          </div>

          <div class="risk-indicators">
            ${this.data.results.risks.insomnia ? `
              <div class="risk-indicator">
                <div class="risk-circle risk-${this.data.results.risks.insomnia}">
                  ${this.data.results.risks.insomnia.charAt(0).toUpperCase()}
                </div>
                <div>Insomnia Risk</div>
                <small>${this.data.results.risks.insomnia}</small>
              </div>
            ` : ''}
            
            ${this.data.results.risks.apnea ? `
              <div class="risk-indicator">
                <div class="risk-circle risk-${this.data.results.risks.apnea}">
                  ${this.data.results.risks.apnea.charAt(0).toUpperCase()}
                </div>
                <div>Apnea Risk</div>
                <small>${this.data.results.risks.apnea}</small>
              </div>
            ` : ''}
          </div>

          <div class="charts-container">
            <div class="chart-card">
              <h3>Risk Distribution</h3>
              <div class="chart-wrapper">
                <canvas id="riskChart"></canvas>
              </div>
            </div>
            
            <div class="chart-card">
              <h3>Rule Categories</h3>
              <div class="chart-wrapper">
                <canvas id="categoryChart"></canvas>
              </div>
            </div>
          </div>

          <h3><i class="fas fa-stream"></i> Inference Timeline</h3>
          <div class="timeline" id="timeline"></div>
        ` : `
          <div class="placeholder">
            <i class="fas fa-chart-line"></i>
            <p>Run a diagnosis to see visualizations and analytics</p>
          </div>
        `}
      </div>
    `;

    if (this.data) {
      this.createCharts();
      this.createTimeline();
    }
  }

  createCharts() {
    // Destroy existing charts
    if (this.chart) {
      this.chart.destroy();
    }

    // Risk Chart
    const riskCtx = this.shadowRoot.getElementById('riskChart');
    if (riskCtx) {
      const riskData = {
        labels: ['Insomnia Risk', 'Apnea Risk', 'Lifestyle Issues', 'Confidence'],
        datasets: [{
          label: 'Risk Levels',
          data: [
            this.getRiskScore(this.data.results.risks.insomnia),
            this.getRiskScore(this.data.results.risks.apnea),
            Object.values(this.data.results.lifestyleIssues).filter(v => v).length * 25,
            this.data.results.confidence || 75
          ],
          backgroundColor: [
            'rgba(231, 76, 60, 0.7)',
            'rgba(243, 156, 18, 0.7)',
            'rgba(52, 152, 219, 0.7)',
            'rgba(46, 204, 113, 0.7)'
          ],
          borderColor: [
            'rgb(231, 76, 60)',
            'rgb(243, 156, 18)',
            'rgb(52, 152, 219)',
            'rgb(46, 204, 113)'
          ],
          borderWidth: 2
        }]
      };

      new Chart(riskCtx, {
        type: 'radar',
        data: riskData,
        options: {
          scales: {
            r: {
              beginAtZero: true,
              max: 100,
              ticks: {
                stepSize: 25
              }
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }

    // Category Chart
    const categoryCtx = this.shadowRoot.getElementById('categoryChart');
    if (categoryCtx) {
      const categoryCounts = {};
      this.data.rules.firedDetails?.forEach(rule => {
        categoryCounts[rule.category] = (categoryCounts[rule.category] || 0) + 1;
      });

      const categoryData = {
        labels: Object.keys(categoryCounts).map(c => this.capitalize(c)),
        datasets: [{
          data: Object.values(categoryCounts),
          backgroundColor: [
            'rgba(67, 97, 238, 0.7)',
            'rgba(114, 9, 183, 0.7)',
            'rgba(46, 204, 113, 0.7)',
            'rgba(243, 156, 18, 0.7)',
            'rgba(231, 76, 60, 0.7)'
          ],
          borderColor: [
            'rgb(67, 97, 238)',
            'rgb(114, 9, 183)',
            'rgb(46, 204, 113)',
            'rgb(243, 156, 18)',
            'rgb(231, 76, 60)'
          ],
          borderWidth: 2
        }]
      };

      new Chart(categoryCtx, {
        type: 'doughnut',
        data: categoryData,
        options: {
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }
  }

  createTimeline() {
    const timeline = this.shadowRoot.getElementById('timeline');
    if (!timeline) return;

    const events = [
      {
        title: 'Input Processing',
        description: 'Patient data categorized and normalized',
        time: 'Start'
      }
    ];

    // Add risk assessments
    if (this.data.results.risks.insomnia) {
      events.push({
        title: 'Insomnia Risk Assessment',
        description: `${this.data.results.risks.insomnia.toUpperCase()} risk detected`,
        time: 'Stage 1'
      });
    }

    if (this.data.results.risks.apnea) {
      events.push({
        title: 'Sleep Apnea Risk Assessment',
        description: `${this.data.results.risks.apnea.toUpperCase()} risk detected`,
        time: 'Stage 1'
      });
    }

    // Add lifestyle issues
    const lifestyleCount = Object.values(this.data.results.lifestyleIssues).filter(v => v).length;
    if (lifestyleCount > 0) {
      events.push({
        title: 'Lifestyle Analysis',
        description: `${lifestyleCount} lifestyle issue${lifestyleCount > 1 ? 's' : ''} identified`,
        time: 'Stage 2'
      });
    }

    // Add diagnosis
    events.push({
      title: 'Final Diagnosis',
      description: this.data.diagnosis,
      time: 'Stage 3'
    });

    // Add recommendations
    if (this.data.results.recommendations.length > 0) {
      events.push({
        title: 'Recommendations Generated',
        description: `${this.data.results.recommendations.length} recommendation${this.data.results.recommendations.length > 1 ? 's' : ''} provided`,
        time: 'Stage 4'
      });
    }

    // Render timeline
    timeline.innerHTML = events.map(event => `
      <div class="timeline-item">
        <div class="timeline-title">${event.title}</div>
        <div class="timeline-desc">${event.description}</div>
        <small style="color: #4361ee;">${event.time}</small>
      </div>
    `).join('');
  }

  getRiskScore(riskLevel) {
    const scores = {
      'high': 100,
      'moderate': 66,
      'low': 33,
      'none': 0
    };
    return scores[riskLevel] || 0;
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  disconnectedCallback() {
    // Clean up charts
    if (this.chart) {
      this.chart.destroy();
    }
  }
}

customElements.define('kbs-visualization', Visualization);