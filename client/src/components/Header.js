class Header extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          --primary: #4361ee;
          --secondary: #7209b7;
          --dark: #2c3e50;
          --light: #f8f9fa;
        }

        .header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .header h1 {
          font-family: 'Poppins', sans-serif;
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header h1 i {
          color: var(--secondary);
        }

        .subtitle {
          color: #95a5a6;
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .stat-card {
          background: var(--light);
          padding: 1.5rem;
          border-radius: 12px;
          text-align: center;
          transition: transform 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
        }

        .stat-card i {
          font-size: 2rem;
          color: var(--primary);
          margin-bottom: 0.5rem;
        }

        .stat-card h3 {
          font-size: 2rem;
          color: var(--dark);
          margin-bottom: 0.5rem;
        }

        .stat-card p {
          color: #95a5a6;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .header h1 {
            font-size: 2rem;
          }
          
          .stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      </style>

      <header class="header">
        <h1><i class="fas fa-moon"></i> Sleep Health KBS</h1>
        <p class="subtitle">Knowledge-Based System for Sleep Disorder Diagnosis (Insomnia / Sleep Apnea)</p>
        <p>Final Project – AI-Powered Sleep Health Assessment System</p>
        
        <div class="stats">
          <div class="stat-card">
            <i class="fas fa-rules"></i>
            <h3>20</h3>
            <p>Expert Rules</p>
          </div>
          <div class="stat-card">
            <i class="fas fa-stethoscope"></i>
            <h3>4</h3>
            <p>Diagnosis Types</p>
          </div>
          <div class="stat-card">
            <i class="fas fa-chart-line"></i>
            <h3>10+</h3>
            <p>Health Metrics</p>
          </div>
          <div class="stat-card">
            <i class="fas fa-lightbulb"></i>
            <h3>5</h3>
            <p>Recommendations</p>
          </div>
        </div>
      </header>
    `;
  }
}

customElements.define('kbs-header', Header);