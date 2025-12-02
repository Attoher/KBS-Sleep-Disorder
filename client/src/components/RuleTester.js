class RuleTester extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.rules = [];
  }

  async connectedCallback() {
    await this.loadRules();
    this.render();
  }

  async loadRules() {
    try {
      const response = await fetch('/api/diagnosis/rules');
      const data = await response.json();
      this.rules = data.rules;
    } catch (error) {
      console.error('Failed to load rules:', error);
      // Fallback rules
      this.rules = this.getDefaultRules();
    }
  }

  getDefaultRules() {
    return [
      { id: 'R1', name: 'Insomnia High Risk', category: 'insomnia', source: 'AASM/Morin 2012' },
      { id: 'R2', name: 'Insomnia Moderate Risk', category: 'insomnia', source: 'AASM' },
      { id: 'R3', name: 'Insomnia Moderate Risk', category: 'insomnia', source: 'Insomnia literature' },
      { id: 'R4', name: 'Insomnia Low Risk', category: 'insomnia', source: 'AASM/WHO' },
      { id: 'R5', name: 'Apnea High Risk', category: 'apnea', source: 'AASM/OSA guideline' },
      { id: 'R6', name: 'Apnea Moderate Risk', category: 'apnea', source: 'OSA literature' },
      { id: 'R7', name: 'Apnea Moderate Risk', category: 'apnea', source: 'OSA literature' },
      { id: 'R8', name: 'Apnea Low Risk', category: 'apnea', source: 'Clinical baseline' },
      { id: 'R9', name: 'Low Activity Issue', category: 'lifestyle', source: 'WHO' },
      { id: 'R10', name: 'High Stress Issue', category: 'lifestyle', source: 'Psychology literature' },
      { id: 'R11', name: 'Short Sleep Issue', category: 'lifestyle', source: 'AASM/WHO' },
      { id: 'R12', name: 'Weight Issue', category: 'lifestyle', source: 'WHO' },
      { id: 'R13', name: 'Diagnosis: Insomnia', category: 'diagnosis', source: 'AASM' },
      { id: 'R14', name: 'Diagnosis: Apnea', category: 'diagnosis', source: 'AASM' },
      { id: 'R15', name: 'Diagnosis: Mixed', category: 'diagnosis', source: 'Clinical' },
      { id: 'R16', name: 'Diagnosis: None', category: 'diagnosis', source: 'Clinical' },
      { id: 'R17', name: 'Sleep Hygiene Rec', category: 'recommendation', source: 'AASM' },
      { id: 'R18', name: 'Physical Activity Rec', category: 'recommendation', source: 'WHO' },
      { id: 'R19', name: 'Stress Management Rec', category: 'recommendation', source: 'Psychology' },
      { id: 'R20', name: 'Weight + Apnea Eval Rec', category: 'recommendation', source: 'OSA guideline' }
    ];
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

        .category-section {
          margin-bottom: 2rem;
        }

        .rules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }

        .rule-card {
          background: var(--light);
          padding: 1rem;
          border-radius: 8px;
          border: 2px solid var(--border);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .rule-card:hover {
          border-color: var(--primary);
          transform: translateY(-3px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.1);
        }

        .rule-card.active {
          border-color: var(--success);
          background: rgba(46, 204, 113, 0.1);
        }

        .rule-card.failed {
          border-color: var(--danger);
          background: rgba(231, 76, 60, 0.1);
        }

        .rule-id {
          display: inline-block;
          background: var(--primary);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .rule-name {
          font-weight: 600;
          color: var(--dark);
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
        }

        .rule-meta {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 1rem;
        }

        .test-btn {
          background: var(--secondary);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .test-btn:hover {
          background: #5a0b9e;
        }

        .test-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .test-result {
          margin-top: 0.5rem;
          padding: 0.5rem;
          border-radius: 4px;
          font-size: 0.9rem;
          display: none;
        }

        .test-result.success {
          background: rgba(46, 204, 113, 0.1);
          border: 1px solid var(--success);
          color: var(--success);
          display: block;
        }

        .test-result.failure {
          background: rgba(231, 76, 60, 0.1);
          border: 1px solid var(--danger);
          color: var(--danger);
          display: block;
        }

        .test-result.error {
          background: rgba(243, 156, 18, 0.1);
          border: 1px solid var(--warning);
          color: var(--warning);
          display: block;
        }

        .batch-controls {
          background: var(--light);
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .batch-btn {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1.1rem;
          transition: transform 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .batch-btn:hover {
          transform: translateY(-2px);
        }

        .batch-results {
          margin-top: 1rem;
          display: none;
        }

        .batch-results.show {
          display: block;
        }

        .result-summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-top: 1rem;
        }

        .summary-card {
          background: white;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .summary-card.success {
          border-top: 4px solid var(--success);
        }

        .summary-card.failure {
          border-top: 4px solid var(--warning);
        }

        .summary-card.error {
          border-top: 4px solid var(--danger);
        }

        .summary-count {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .category-filter {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 0.5rem 1rem;
          border: 2px solid var(--border);
          background: white;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-btn.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .filter-btn:hover:not(.active) {
          border-color: var(--primary);
        }

        @media (max-width: 768px) {
          .rules-grid {
            grid-template-columns: 1fr;
          }
          
          .result-summary {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      </style>

      <div class="card">
        <h2><i class="fas fa-vial"></i> Rule Testing Laboratory</h2>
        
        <div class="batch-controls">
          <button class="batch-btn" id="testAllBtn">
            <i class="fas fa-play-circle"></i> Test All Rules
          </button>
          <button class="batch-btn" id="clearAllBtn" style="background: #95a5a6; margin-left: 1rem;">
            <i class="fas fa-broom"></i> Clear Results
          </button>
        </div>

        <div class="batch-results" id="batchResults">
          <h3>Batch Test Results</h3>
          <div class="result-summary" id="resultSummary"></div>
        </div>

        <div class="category-filter" id="categoryFilter"></div>

        ${this.rules.length > 0 ? this.renderRulesByCategory() : '<p>Loading rules...</p>'}
      </div>
    `;

    this.setupEventListeners();
    this.renderCategoryFilters();
  }

  renderRulesByCategory() {
    const categories = {};
    this.rules.forEach(rule => {
      if (!categories[rule.category]) {
        categories[rule.category] = [];
      }
      categories[rule.category].push(rule);
    });

    let html = '';
    for (const [category, rules] of Object.entries(categories)) {
      html += `
        <div class="category-section" data-category="${category}">
          <h3>${this.capitalize(category)} Rules (${rules.length})</h3>
          <div class="rules-grid">
            ${rules.map(rule => this.renderRuleCard(rule)).join('')}
          </div>
        </div>
      `;
    }
    return html;
  }

  renderRuleCard(rule) {
    return `
      <div class="rule-card" data-rule-id="${rule.id}" data-category="${rule.category}">
        <div class="rule-id">${rule.id}</div>
        <div class="rule-name">${rule.name}</div>
        <div class="rule-meta">
          <div><strong>Category:</strong> ${rule.category}</div>
          <div><strong>Source:</strong> ${rule.source}</div>
        </div>
        <button class="test-btn" data-rule-id="${rule.id}">
          <i class="fas fa-vial"></i> Test Rule
        </button>
        <div class="test-result" id="result-${rule.id}"></div>
      </div>
    `;
  }

  renderCategoryFilters() {
    const categories = ['all', 'insomnia', 'apnea', 'lifestyle', 'diagnosis', 'recommendation'];
    const filterContainer = this.shadowRoot.getElementById('categoryFilter');
    
    categories.forEach(category => {
      const button = document.createElement('button');
      button.className = `filter-btn ${category === 'all' ? 'active' : ''}`;
      button.textContent = this.capitalize(category);
      button.dataset.category = category;
      button.addEventListener('click', () => this.filterByCategory(category));
      filterContainer.appendChild(button);
    });
  }

  filterByCategory(category) {
    // Update active filter button
    this.shadowRoot.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });

    // Show/hide rule sections
    this.shadowRoot.querySelectorAll('.category-section').forEach(section => {
      if (category === 'all' || section.dataset.category === category) {
        section.style.display = 'block';
      } else {
        section.style.display = 'none';
      }
    });
  }

  setupEventListeners() {
    // Test individual rule buttons
    this.shadowRoot.querySelectorAll('.test-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const ruleId = e.target.dataset.ruleId;
        await this.testRule(ruleId);
      });
    });

    // Test all rules button
    this.shadowRoot.getElementById('testAllBtn').addEventListener('click', async () => {
      await this.testAllRules();
    });

    // Clear all results button
    this.shadowRoot.getElementById('clearAllBtn').addEventListener('click', () => {
      this.clearAllResults();
    });
  }

  async testRule(ruleId) {
    const ruleCard = this.shadowRoot.querySelector(`[data-rule-id="${ruleId}"]`);
    const testBtn = ruleCard.querySelector('.test-btn');
    const resultDiv = ruleCard.querySelector('.test-result');
    
    testBtn.disabled = true;
    testBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
    resultDiv.className = 'test-result';
    resultDiv.textContent = '';

    try {
      const response = await fetch(`/api/diagnosis/rules/${ruleId}`);
      const data = await response.json();

      if (data.ruleFired) {
        ruleCard.classList.add('active');
        ruleCard.classList.remove('failed');
        resultDiv.className = 'test-result success';
        resultDiv.textContent = `✅ Rule fired successfully! Diagnosis: ${data.results?.diagnosis || 'N/A'}`;
      } else {
        ruleCard.classList.add('failed');
        ruleCard.classList.remove('active');
        resultDiv.className = 'test-result failure';
        resultDiv.textContent = `❌ Rule did not fire. Diagnosis: ${data.results?.diagnosis || 'N/A'}`;
      }

      // Highlight rules that fired
      if (data.allFiredRules) {
        data.allFiredRules.forEach(firedRuleId => {
          const firedCard = this.shadowRoot.querySelector(`[data-rule-id="${firedRuleId}"]`);
          if (firedCard && firedRuleId !== ruleId) {
            firedCard.classList.add('active');
          }
        });
      }
    } catch (error) {
      ruleCard.classList.add('failed');
      resultDiv.className = 'test-result error';
      resultDiv.textContent = `⚠️ Error: ${error.message}`;
    } finally {
      testBtn.disabled = false;
      testBtn.innerHTML = '<i class="fas fa-vial"></i> Test Rule';
    }
  }

  async testAllRules() {
    const batchResults = this.shadowRoot.getElementById('batchResults');
    const resultSummary = this.shadowRoot.getElementById('resultSummary');
    const testAllBtn = this.shadowRoot.getElementById('testAllBtn');
    
    batchResults.classList.add('show');
    resultSummary.innerHTML = '<div class="summary-card"><div class="summary-count"><i class="fas fa-spinner fa-spin"></i></div><div>Testing...</div></div>';
    testAllBtn.disabled = true;
    testAllBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing All Rules...';

    // Clear previous results
    this.clearAllResults();

    const results = {
      success: 0,
      failure: 0,
      error: 0,
      total: this.rules.length
    };

    // Test each rule sequentially
    for (const rule of this.rules) {
      try {
        const response = await fetch(`/api/diagnosis/rules/${rule.id}`);
        const data = await response.json();

        if (data.ruleFired) {
          results.success++;
          const ruleCard = this.shadowRoot.querySelector(`[data-rule-id="${rule.id}"]`);
          if (ruleCard) {
            ruleCard.classList.add('active');
            ruleCard.querySelector('.test-result').className = 'test-result success';
            ruleCard.querySelector('.test-result').textContent = '✅ Success';
          }
        } else {
          results.failure++;
          const ruleCard = this.shadowRoot.querySelector(`[data-rule-id="${rule.id}"]`);
          if (ruleCard) {
            ruleCard.classList.add('failed');
            ruleCard.querySelector('.test-result').className = 'test-result failure';
            ruleCard.querySelector('.test-result').textContent = '❌ Did not fire';
          }
        }
      } catch (error) {
        results.error++;
        const ruleCard = this.shadowRoot.querySelector(`[data-rule-id="${rule.id}"]`);
        if (ruleCard) {
          ruleCard.classList.add('failed');
          ruleCard.querySelector('.test-result').className = 'test-result error';
          ruleCard.querySelector('.test-result').textContent = '⚠️ Error';
        }
      }

      // Update summary in real-time
      this.updateResultSummary(results);
    }

    testAllBtn.disabled = false;
    testAllBtn.innerHTML = '<i class="fas fa-play-circle"></i> Test All Rules';
  }

  updateResultSummary(results) {
    const resultSummary = this.shadowRoot.getElementById('resultSummary');
    
    resultSummary.innerHTML = `
      <div class="summary-card success">
        <div class="summary-count">${results.success}</div>
        <div>Success</div>
        <small>${Math.round((results.success / results.total) * 100)}%</small>
      </div>
      <div class="summary-card failure">
        <div class="summary-count">${results.failure}</div>
        <div>Did Not Fire</div>
        <small>${Math.round((results.failure / results.total) * 100)}%</small>
      </div>
      <div class="summary-card error">
        <div class="summary-count">${results.error}</div>
        <div>Errors</div>
        <small>${Math.round((results.error / results.total) * 100)}%</small>
      </div>
      <div class="summary-card">
        <div class="summary-count">${results.total}</div>
        <div>Total Rules</div>
        <small>100%</small>
      </div>
    `;
  }

  clearAllResults() {
    // Clear rule card classes
    this.shadowRoot.querySelectorAll('.rule-card').forEach(card => {
      card.classList.remove('active', 'failed');
    });

    // Clear result messages
    this.shadowRoot.querySelectorAll('.test-result').forEach(result => {
      result.className = 'test-result';
      result.textContent = '';
    });

    // Hide batch results
    this.shadowRoot.getElementById('batchResults').classList.remove('show');
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

customElements.define('rule-tester', RuleTester);