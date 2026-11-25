// Section 5: Prize Pool, Registration Fees & What's Included
// Structured Layout:
// Row 1 (Two Equal Columns):
//   - Left: PRIZE DISTRIBUTION // FINALE (Total Pool ₹40k+, 18-Hour Finale, 1st, 2nd, 3rd)
//   - Right: REGISTRATION MATRIX // TWO-PHASE (Round 1 ₹200, Round 2 ₹500, Inclusions, Total Callout)
// Row 2 (Full Width):
//   - PARTICIPANT TIERS // RECOGNITION (Tiers 01, 02, 03 & Certificate Distribution Matrix)
import { Reveal } from './ui';
import { Icon } from './Icons';
import SoonChip from './SoonChip';
import { useRound2Soon } from './round2';
import {
  PRIZE_DATA,
  FEE_DATA,

  PARTICIPANT_TIERS,
  CERTIFICATE_SUMMARY,
} from '../data/vibeathonData';
import './PrizePool.css';

export default function PrizePool() {
  const round2Soon = useRound2Soon();   // "Publishing soon", or '' once the Round 2 details switch is on
  const { totalPool, eventHighlight, distribution } = PRIZE_DATA;
  const firstPrize = distribution.find((p) => p.rank === '01');
  const runnerUpPrizes = distribution.filter((p) => p.rank !== '01');

  return (
    <section id="prize-pool" className="pp-section" aria-labelledby="pp-heading">
      <Reveal className="pp-head">
        <span className="pp-eyebrow">Rewards &amp; Registration</span>
        <h2 id="pp-heading" className="pp-h">Prizes &amp; Fees</h2>
        <p className="pp-sub">
          Official prize distribution, two-phase team registration structure, and verified participant rewards.
        </p>
      </Reveal>

      {/* ================================================================
          ROW 1: TWO EQUAL COLUMNS (PRIZES & REGISTRATION)
          ================================================================ */}
      <div className="pp-top-row">
        {/* LEFT COLUMN: PRIZE DISTRIBUTION // FINALE */}
        <Reveal delay={60} className="pp-col-reveal">
          <div className="pp-card pp-prize-col-card" role="region" aria-label="Prize Distribution">
            <span className="pp-hero-ghost" aria-hidden="true">40K</span>

            <div className="pp-card-ribbon" aria-hidden="true">
              <span className="pp-ribbon-tag">PRIZE DISTRIBUTION // FINALE</span>
              <span className="pp-ribbon-stat">CASH REWARDS</span>
            </div>

            <div className="pp-card-inner">
              {/* Total Prize Pool Hero */}
              <div className="pp-pool-block">
                <span className="pp-pool-label">TOTAL PRIZE POOL</span>
                <div className="pp-pool-val">{totalPool}</div>
              </div>

              {/* 18-Hour Offline Finale Secondary Highlight */}
              <div className="pp-event-highlight">
                <div className="pp-event-badge" aria-hidden="true">
                  <Icon.Clock size={16} />
                </div>
                <div className="pp-event-meta">
                  <span className="pp-event-label">EVENT DURATION &amp; FORMAT</span>
                  <strong className="pp-event-val">{eventHighlight}</strong>
                </div>
              </div>

              {/* Podium Breakdown */}
              <div className="pp-dist-wrap">
                <span className="pp-dist-header" aria-hidden="true">
                  OFFICIAL PRIZE BREAKDOWN
                </span>

                {/* 1st Prize — Strongest Prominence */}
                {firstPrize && (
                  <div
                    className="pp-prize-card pp-prize-first"
                    style={{ '--pza': firstPrize.accent, '--pza-rgb': firstPrize.accentRgb }}
                  >
                    <span className="pp-prize-ghost" aria-hidden="true">{firstPrize.rank}</span>
                    <div className="pp-prize-head">
                      <span className="pp-prize-badge">{firstPrize.tag}</span>
                      <div className="pp-prize-icon" aria-hidden="true">
                        <Icon.Trophy size={18} />
                      </div>
                    </div>
                    <div className="pp-prize-body">
                      <span className="pp-prize-rank">{firstPrize.title}</span>
                      <div className="pp-prize-amt">{firstPrize.amount}</div>
                    </div>
                    <div className="pp-card-corner" aria-hidden="true" />
                  </div>
                )}

                {/* 2nd & 3rd Prize Grid */}
                <div className="pp-runner-grid">
                  {runnerUpPrizes.map((p) => {
                    const IconC = Icon[p.icon] || Icon.Trophy;
                    return (
                      <div
                        key={p.rank}
                        className="pp-prize-card pp-prize-runner"
                        style={{ '--pza': p.accent, '--pza-rgb': p.accentRgb }}
                      >
                        <span className="pp-prize-ghost" aria-hidden="true">{p.rank}</span>
                        <div className="pp-prize-head">
                          <span className="pp-prize-badge">{p.tag}</span>
                          <div className="pp-prize-icon" aria-hidden="true">
                            <IconC size={15} />
                          </div>
                        </div>
                        <div className="pp-prize-body">
                          <span className="pp-prize-rank">{p.title}</span>
                          <div className="pp-prize-amt">{p.amount}</div>
                        </div>
                        <div className="pp-card-corner" aria-hidden="true" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pp-card-corner" aria-hidden="true" />
          </div>
        </Reveal>

        {/* RIGHT COLUMN: REGISTRATION MATRIX // TWO-PHASE */}
        <Reveal delay={100} className="pp-col-reveal">
          <div className="pp-card pp-fees-col-card" role="region" aria-label="Registration Fee Structure">
            <div className="pp-card-ribbon" aria-hidden="true">
              <span className="pp-ribbon-tag">REGISTRATION MATRIX // TWO-PHASE</span>
              <span className="pp-ribbon-stat">PER TEAM</span>
            </div>

            <div className="pp-card-inner pp-fees-inner">
              <div className="pp-phases">
                {/* Round 1 Fee Box */}
                <div className="pp-phase-box pp-phase-r1">
                  <div className="pp-phase-head">
                    <div>
                      <span className="pp-phase-badge">{FEE_DATA.round1.subtitle}</span>
                      <h3 className="pp-phase-name">{FEE_DATA.round1.title}</h3>
                    </div>
                    <div className="pp-phase-cost">
                      <span className="pp-cost-val">{FEE_DATA.round1.amount}</span>
                      <span className="pp-cost-unit">{FEE_DATA.round1.unit}</span>
                    </div>
                  </div>
                  <p className="pp-phase-desc">{FEE_DATA.round1.details}</p>
                </div>

                {/* Round 2 Fee Box */}
                <div className="pp-phase-box pp-phase-r2">
                  {round2Soon ? (
                    <>
                      <h3 className="pp-phase-name">{FEE_DATA.round2.title}</h3>
                      <SoonChip className="is-strip" />
                    </>
                  ) : (
                    <>
                      <div className="pp-phase-head">
                        <div>
                          <span className="pp-phase-badge highlight">{FEE_DATA.round2.subtitle}</span>
                          <h3 className="pp-phase-name">{FEE_DATA.round2.title}</h3>
                        </div>
                        <div className="pp-phase-cost">
                          <span className="pp-cost-val highlight">{FEE_DATA.round2.liveAmount || FEE_DATA.round2.amount}</span>
                          <span className="pp-cost-unit">{FEE_DATA.round2.unit}</span>
                        </div>
                      </div>

                      <p className="pp-phase-qualify-note">
                        {FEE_DATA.round2.payable}
                      </p>

                      <ul className="pp-r2-when" aria-label="Round 2 dates">
                        {(FEE_DATA.round2.schedule || []).map((row) => (
                          <li key={row.label}>
                            <span className="pp-r2-k">{row.label}</span>
                            <span className="pp-r2-v">{row.value}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="pp-inclusions-block">
                        <span className="pp-inclusions-title">INCLUDES (ROUND 2 ONLY):</span>
                        <ul className="pp-inclusions-list">
                          {FEE_DATA.round2.inclusions.map((inc) => (
                            <li key={inc}>
                              <span className="pp-inc-check" aria-hidden="true">
                                <Icon.Check size={14} />
                              </span>
                              <span>{inc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="pp-card-corner" aria-hidden="true" />
          </div>
        </Reveal>
      </div>

      {/* ================================================================
          ROW 2: FULL WIDTH (PARTICIPANT TIERS // RECOGNITION)
          ================================================================ */}
      <Reveal delay={140} className="pp-bottom-reveal">
        <div className="pp-card pp-bottom-row-card" role="region" aria-label="Participant Rewards & Certificate Distribution">
          <div className="pp-card-ribbon" aria-hidden="true">
            <span className="pp-ribbon-tag">PARTICIPANT TIERS // RECOGNITION</span>
            <span className="pp-ribbon-stat">WINNERS, RUNNER-UP &amp; PARTICIPANT REWARDS</span>
          </div>

          <div className="pp-bottom-inner">
            {/* 3 Participant Level Blocks (3-Column Grid on Desktop) */}
            <div className="pp-tiers-container">
              {PARTICIPANT_TIERS.map((tier) => {
                const IconC = Icon[tier.icon] || Icon.Files;
                const isWinner = tier.tier === '01';
                const isPhysical = tier.tier === '02';
                return (
                  <div
                    key={tier.tier}
                    className={`pp-tier-block pp-tier-${tier.tier}${isWinner ? ' is-winner' : ''}`}
                    style={{ '--tra': tier.accent, '--tra-rgb': tier.accentRgb }}
                  >
                    <div className="pp-tb-head">
                      <div className="pp-tb-badge-row">
                        <span className="pp-tb-id">TIER {tier.tier}</span>
                        <span className="pp-tb-tag">{tier.tag}</span>
                      </div>
                      <span
                        className={`pp-cert-pill ${
                          isWinner ? 'pill-winner' : isPhysical ? 'pill-physical' : 'pill-ecert'
                        }`}
                      >
                        {tier.certBadge}
                      </span>
                      <div className="pp-tb-title-row">
                        <div className="pp-tb-icon" aria-hidden="true">
                          <IconC size={16} />
                        </div>
                        <div>
                          <h4 className="pp-tb-title">{tier.category}</h4>
                          <span className="pp-tb-scope">{tier.scope}</span>
                        </div>
                      </div>
                    </div>

                    <ul className="pp-tb-rewards">
                      {tier.rewards.map((rew) => (
                        <li key={rew}>
                          <span className="pp-tb-bullet" aria-hidden="true" />
                          <span>{rew}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Quick Summary Matrix */}
            <div className="pp-cert-summary">
              <span className="pp-cs-label" aria-hidden="true">
                // CERTIFICATE DISTRIBUTION SUMMARY
              </span>
              <div className="pp-cs-grid">
                {CERTIFICATE_SUMMARY.map((row) => (
                  <div key={row.category} className="pp-cs-row">
                    <div className="pp-cs-cat">
                      <strong className="pp-cs-name">{row.category}</strong>
                      <span className="pp-cs-scope">{row.scope}</span>
                    </div>
                    <div className="pp-cs-rec">
                      <span className="pp-cs-badge" style={{ color: row.accent, borderColor: row.accent }}>
                        {row.badge}
                      </span>
                      <span className="pp-cs-text">{row.recognition}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pp-card-corner" aria-hidden="true" />
        </div>
      </Reveal>
    </section>
  );
}
