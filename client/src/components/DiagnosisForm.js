class DiagnosisForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.data = {
      age: 45,
      gender: 'Male',
      sleepDuration: 7.5,
      sleepQuality: 7,
      stressLevel: 5,
      activityMinutes: 30,
      bmiCategory: 'Obese',
      bloodPressure: '150/95',
      heartRate: 72,
      dailySteps: 5000
    };
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
          --primary: #4361ee;
          --primary-dark: #3a56d4;
          --border: #e0e0e0;
          --dark: #2c3e50;
          --light: #f8f9fa;
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
          color: #7209b7;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--dark);
        }

        .form-control {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid var(--border);
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        .form-control:focus {
          outline: none;
          border-color: var(--primary);
        }

        .slider-container {
          background: var(--light);
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .slider-value {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .value-display {
          font-weight: 600;
          color: var(--primary);
          font-size: 1.2rem;
        }

        input[type="range"] {
          width: 100%;
          height: 8px;
          -webkit-appearance: none;
          background: linear-gradient(to right, #2ecc71, #f39c12, #e74c3c);
          border-radius: 4px;
          outline: none;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 24px;
          height: 24px;
          background: var(--primary);
          border-radius: 50%;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .btn {
          padding: 1rem 2rem;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: var(--primary);
          color: white;
        }

        .btn-primary:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
        }

        .btn-block {
          width: 100%;
          justify-content: center;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      </style>

      <div class="card">
        <h2><i class="fas fa-user-md"></i> Patient Assessment</h2>
        
        <div class="form-group">
          <label for="age">Age (years)</label>
          <input type="number" id="age" class="form-control" min="1" max="120" value="45">
        </div>

        <div class="form-group">
          <label for="gender">Gender</label>
          <select id="gender" class="form-control">
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div class="slider-container">
          <div class="slider-value">
            <span>Sleep Duration</span>
            <span class="value-display" id="sleepDurationValue">7.5 hours</span>
          </div>
          <input type="range" id="sleepDuration" min="0" max="12" step="0.5" value="7.5">
        </div>

        <div class="slider-container">
          <div class="slider-value">
            <span>Sleep Quality (1-10)</span>
            <span class="value-display" id="sleepQualityValue">7</span>
          </div>
          <input type="range" id="sleepQuality" min="1" max="10" step="1" value="7">
        </div>

        <div class="slider-container">
          <div class="slider-value">
            <span>Stress Level (1-10)</span>
            <span class="value-display" id="stressValue">5</span>
          </div>
          <input type="range" id="stressLevel" min="1" max="10" step="1" value="5">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="activity">Physical Activity (min/day)</label>
            <input type="number" id="activity" class="form-control" min="0" max="600" value="30">
          </div>
          
          <div class="form-group">
            <label for="heartRate">Heart Rate (bpm)</label>
            <input type="number" id="heartRate" class="form-control" min="30" max="200" value="72">
          </div>
        </div>

        <div class="form-group">
          <label for="bmi">BMI Category</label>
          <select id="bmi" class="form-control">
            <option value="Normal">Normal</option>
            <option value="Overweight">Overweight</option>
            <option value="Obese" selected>Obese</option>
            <option value="Underweight">Underweight</option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="bp">Blood Pressure</label>
            <input type="text" id="bp" class="form-control" placeholder="120/80" value="150/95">
          </div>
          
          <div class="form-group">
            <label for="dailySteps">Daily Steps</label>
            <input type="number" id="dailySteps" class="form-control" min="0" max="50000" value="5000">
          </div>
        </div>

        <button class="btn btn-primary btn-block" id="diagnoseBtn">
          <i class="fas fa-play-circle"></i> Run Diagnosis
        </button>

        <div style="margin-top: 1rem; text-align: center;">
          <button class="btn" id="resetBtn" style="background: #95a5a6; color: white;">
            <i class="fas fa-redo"></i> Reset Form
          </button>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // Update slider displays
    this.shadowRoot.getElementById('sleepDuration').addEventListener('input', (e) => {
      this.shadowRoot.getElementById('sleepDurationValue').textContent = e.target.value + ' hours';
      this.data.sleepDuration = parseFloat(e.target.value);
    });

    this.shadowRoot.getElementById('sleepQuality').addEventListener('input', (e) => {
      this.shadowRoot.getElementById('sleepQualityValue').textContent = e.target.value;
      this.data.sleepQuality = parseInt(e.target.value);
    });

    this.shadowRoot.getElementById('stressLevel').addEventListener('input', (e) => {
      this.shadowRoot.getElementById('stressValue').textContent = e.target.value;
      this.data.stressLevel = parseInt(e.target.value);
    });

    // Update other inputs
    this.shadowRoot.getElementById('age').addEventListener('input', (e) => {
      this.data.age = parseInt(e.target.value);
    });

    this.shadowRoot.getElementById('gender').addEventListener('change', (e) => {
      this.data.gender = e.target.value;
    });

    this.shadowRoot.getElementById('activity').addEventListener('input', (e) => {
      this.data.activityMinutes = parseInt(e.target.value);
    });

    this.shadowRoot.getElementById('heartRate').addEventListener('input', (e) => {
      this.data.heartRate = parseInt(e.target.value);
    });

    this.shadowRoot.getElementById('bmi').addEventListener('change', (e) => {
      this.data.bmiCategory = e.target.value;
    });

    this.shadowRoot.getElementById('bp').addEventListener('input', (e) => {
      this.data.bloodPressure = e.target.value;
    });

    this.shadowRoot.getElementById('dailySteps').addEventListener('input', (e) => {
      this.data.dailySteps = parseInt(e.target.value);
    });

    // Diagnosis button
    this.shadowRoot.getElementById('diagnoseBtn').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('diagnose', {
        detail: { ...this.data },
        bubbles: true,
        composed: true
      }));
    });

    // Reset button
    this.shadowRoot.getElementById('resetBtn').addEventListener('click', () => {
      this.resetForm();
    });
  }

  resetForm() {
    this.data = {
      age: 45,
      gender: 'Male',
      sleepDuration: 7.5,
      sleepQuality: 7,
      stressLevel: 5,
      activityMinutes: 30,
      bmiCategory: 'Obese',
      bloodPressure: '150/95',
      heartRate: 72,
      dailySteps: 5000
    };

    // Update UI
    this.shadowRoot.getElementById('age').value = this.data.age;
    this.shadowRoot.getElementById('gender').value = this.data.gender;
    this.shadowRoot.getElementById('sleepDuration').value = this.data.sleepDuration;
    this.shadowRoot.getElementById('sleepQuality').value = this.data.sleepQuality;
    this.shadowRoot.getElementById('stressLevel').value = this.data.stressLevel;
    this.shadowRoot.getElementById('activity').value = this.data.activityMinutes;
    this.shadowRoot.getElementById('heartRate').value = this.data.heartRate;
    this.shadowRoot.getElementById('bmi').value = this.data.bmiCategory;
    this.shadowRoot.getElementById('bp').value = this.data.bloodPressure;
    this.shadowRoot.getElementById('dailySteps').value = this.data.dailySteps;

    // Update displays
    this.shadowRoot.getElementById('sleepDurationValue').textContent = this.data.sleepDuration + ' hours';
    this.shadowRoot.getElementById('sleepQualityValue').textContent = this.data.sleepQuality;
    this.shadowRoot.getElementById('stressValue').textContent = this.data.stressLevel;

    this.dispatchEvent(new CustomEvent('reset', { bubbles: true, composed: true }));
  }

  getData() {
    return { ...this.data };
  }
}

customElements.define('diagnosis-form', DiagnosisForm);