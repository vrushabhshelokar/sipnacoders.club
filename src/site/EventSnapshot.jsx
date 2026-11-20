// Event Snapshot Strip
// Displays 7 key metrics immediately below the Hero section.
import { Icon } from './Icons';
import './EventSnapshot.css';

const SNAPSHOT_ITEMS = [
  {
    id: 'date',
    label: 'EVENT DATE',
    value: '26–27 DEC',
    sub: '2026 Finale',
    icon: 'Calendar',
    accent: '#7cf2d4',
    accentRgb: '124, 242, 212',
  },
  {
    id: 'duration',
    label: 'DURATION',
    value: '18 HOURS',
    sub: 'Non-stop Sprint',
    icon: 'Clock',
    accent: '#ff5468',
    accentRgb: '255, 84, 104',
  },
  {
    id: 'mode',
    label: 'EVENT MODE',
    value: 'HYBRID',
    sub: 'Online R1➔Offline R2',
    icon: 'Terminal',
    accent: '#4c8dff',
    accentRgb: '76, 141, 255',
  },
  {
    id: 'venue',
    label: 'VENUE',
    value: 'SIPNA COET',
    sub: 'Amravati, Maharashtra',
    icon: 'MapPin',
    accent: '#fbbc05',
    accentRgb: '251, 188, 5',
  },
  {
    id: 'team',
    label: 'TEAM SIZE',
    value: '1–4 SQUAD',
    sub: 'Solo Permitted',
    icon: 'Users',
    accent: '#7cf2d4',
    accentRgb: '124, 242, 212',
  },
  {
    id: 'prizes',
    label: 'PRIZE POOL',
    value: '₹40,000+',
    sub: 'Cash + HR Rewards',
    icon: 'Trophy',
    accent: '#7cf2d4',
    accentRgb: '124, 242, 212',
  },
  {
    id: 'fees',
    label: 'ENTRY FEE',
    value: '₹200',
    sub: '₹200 R1',
    icon: 'CreditCard',
    accent: '#4c8dff',
    accentRgb: '76, 141, 255',
  },
];

export default function EventSnapshot() {
  return (
    <section id="event-snapshot" className="snap-section" aria-label="Event Snapshot">
      <div className="snap-header">
        <div className="snap-tag">
          <span className="snap-led" aria-hidden="true" />
          <span className="snap-tag-text">TELEMETRY // QUICK SPECIFICATIONS</span>
        </div>
        <span className="snap-meta">TOP 75 OFFLINE FINALE · SIPNA COET</span>
      </div>

      <div className="snap-grid">
        {SNAPSHOT_ITEMS.map((item) => {
          const IconComp = Icon[item.icon] || Icon.Calendar;
          return (
            <div
              key={item.id}
              className="snap-card"
              style={{
                '--snap-accent': item.accent,
                '--snap-accent-rgb': item.accentRgb,
              }}
            >
              <div className="snap-card-top">
                <span className="snap-label">{item.label}</span>
                <span className="snap-icon" aria-hidden="true">
                  <IconComp size={14} />
                </span>
              </div>
              <div className="snap-val">{item.value}</div>
              <div className="snap-sub">{item.sub}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
