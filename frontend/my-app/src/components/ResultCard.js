import React, { useState } from 'react';
import './ResultCard.css';

/**
 * ResultCard — displays disease prediction results
 * Shows: disease name, confidence, severity, pesticide info, precautions
 */
export default function ResultCard({ result }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!result) return null;

  const {
    disease,
    confidence,
    confidence_level,
    low_confidence_warning,
    low_confidence_message,
    solution,
    top3_predictions,
    inference_time_ms
  } = result;

  const sol = solution || {};

  // Severity color mapping
  const severityBadge = {
    'None':        'badge-green',
    'Low':         'badge-green',
    'Medium':      'badge-amber',
    'Medium-High': 'badge-amber',
    'High':        'badge-red',
    'Very High':   'badge-red',
    'Critical':    'badge-red',
    'Critical - No Cure': 'badge-red',
    'Unknown':     'badge-gray',
  }[sol.severity] || 'badge-gray';

  const confidenceBadgeClass =
    confidence_level === 'high'   ? 'badge-green' :
    confidence_level === 'medium' ? 'badge-amber' : 'badge-red';

  const isHealthy = disease?.toLowerCase().includes('healthy');

  const TABS = ['overview', 'treatment', 'prevention'];

  return (
    <div className="result-card animate-fade-in-scale">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className={`result-card__header ${isHealthy ? 'result-card__header--healthy' : ''}`}>
        <div className="result-card__header-icon">
          {isHealthy ? '✅' : '🔬'}
        </div>
        <div className="result-card__header-info">
          <h2 className="result-card__disease">{disease}</h2>
          <p className="result-card__plant">
            🌱 {sol.plant || 'Plant'}
          </p>
        </div>

        <div className="result-card__badges">
          <span className={`badge ${confidenceBadgeClass}`}>
            {confidence}% confident
          </span>
          {sol.severity && sol.severity !== 'None' && (
            <span className={`badge ${severityBadge}`}>
              {sol.severity}
            </span>
          )}
        </div>
      </div>

      {/* ── Low Confidence Warning ──────────────────────────── */}
      {low_confidence_warning && (
        <div className="result-card__warning animate-fade-in">
          <span>⚠️</span>
          <p>{low_confidence_message}</p>
        </div>
      )}

      {/* ── Confidence Bar ──────────────────────────────────── */}
      <div className="result-card__confidence">
        <div className="confidence-bar">
          <div
            className={`confidence-bar__fill confidence-bar__fill--${confidence_level}`}
            style={{ width: `${confidence}%` }}
          />
        </div>
        <span className="confidence-bar__label">{confidence}%</span>
      </div>

      {/* ── Tabs ────────────────────────────────────────────── */}
      <div className="result-card__tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {{ overview: '📋 Overview', treatment: '💊 Treatment', prevention: '🛡️ Prevention' }[tab]}
          </button>
        ))}
      </div>

      {/* ── Tab Content ─────────────────────────────────────── */}
      <div className="result-card__content">

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-content animate-fade-in">
            <div className="info-section">
              <h4>📖 Symptoms</h4>
              <p>{sol.symptoms || 'No symptom information available.'}</p>
            </div>

            {!isHealthy && sol.organic_remedy && (
              <div className="info-section">
                <h4>🌿 Organic Remedy</h4>
                <p>{sol.organic_remedy}</p>
              </div>
            )}

            {/* Top 3 alternatives */}
            <div className="info-section">
              <h4>🎯 Top Predictions</h4>
              <div className="top3-list">
                {top3_predictions?.map((pred, idx) => (
                  <div key={idx} className="top3-item">
                    <span className="top3-rank">#{idx + 1}</span>
                    <span className="top3-name">
                      {pred.class.replace('___', ' – ').replace(/_/g, ' ')}
                    </span>
                    <div className="top3-bar-wrap">
                      <div className="top3-bar" style={{ width: `${pred.confidence}%` }} />
                    </div>
                    <span className="top3-pct">{pred.confidence}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Treatment Tab */}
        {activeTab === 'treatment' && (
          <div className="tab-content animate-fade-in">
            {isHealthy ? (
              <div className="info-section info-section--healthy">
                <p>🎉 No treatment needed! Your plant appears healthy. Continue with regular care.</p>
              </div>
            ) : (
              <>
                <div className="info-section">
                  <h4>🧪 Recommended Pesticide</h4>
                  <div className="pesticide-card">
                    <div className="pesticide-row">
                      <span className="pesticide-label">Chemical</span>
                      <span className="pesticide-value">{sol.pesticide?.chemical || 'N/A'}</span>
                    </div>
                    <div className="pesticide-row">
                      <span className="pesticide-label">Dosage</span>
                      <span className="pesticide-value">{sol.pesticide?.dosage || 'N/A'}</span>
                    </div>
                    <div className="pesticide-row">
                      <span className="pesticide-label">Frequency</span>
                      <span className="pesticide-value">{sol.pesticide?.frequency || 'N/A'}</span>
                    </div>
                    <div className="pesticide-row">
                      <span className="pesticide-label">Application</span>
                      <span className="pesticide-value">{sol.pesticide?.application || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {sol.precautions?.length > 0 && (
                  <div className="info-section">
                    <h4>⚠️ Precautions</h4>
                    <ul className="precautions-list">
                      {sol.precautions.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Prevention Tab */}
        {activeTab === 'prevention' && (
          <div className="tab-content animate-fade-in">
            <div className="info-section">
              <h4>🛡️ Prevention Strategy</h4>
              <p>{sol.prevention || 'No prevention info available.'}</p>
            </div>

            {sol.precautions?.length > 0 && (
              <div className="info-section">
                <h4>✅ Action Checklist</h4>
                <ul className="checklist">
                  {sol.precautions.map((p, i) => (
                    <li key={i}>
                      <span className="checklist-icon">○</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────── */}
      <div className="result-card__footer">
        <span className="result-footer-meta">
          ⚡ Analyzed in {inference_time_ms}ms
        </span>
        <span className="result-footer-disclaimer">
          Always consult a local agronomist for confirmation.
        </span>
      </div>
    </div>
  );
}
