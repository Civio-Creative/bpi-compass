'use client';

interface SnapshotCardsProps {
  totalTargets: number;
  avgGenPopReach: number;
  avgDemReach: number;
  avgRepReach: number;
}

export function SnapshotCards({ totalTargets, avgGenPopReach, avgDemReach, avgRepReach }: SnapshotCardsProps) {
  const cards = [
    { label: 'Targets found', value: totalTargets.toString(), color: '#E8E6F0' },
    { label: 'General population reach', value: `${avgGenPopReach}%`, color: '#E8E6F0' },
    { label: 'Democratic reach', value: `${avgDemReach}%`, color: '#85B7EB' },
    { label: 'Republican reach', value: `${avgRepReach}%`, color: '#F09595' },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-[#15151A] rounded-[16px] border border-[rgba(255,255,255,0.08)] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
        >
          <p className="text-[#888780] text-xs mb-2">{card.label}</p>
          <p className="text-[32px] font-medium leading-none" style={{ color: card.color }}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
