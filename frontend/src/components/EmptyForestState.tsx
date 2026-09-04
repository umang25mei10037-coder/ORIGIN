import React from 'react';
import ForestEcosystem from './ForestEcosystem';

interface EmptyForestStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: string;
}

export const EmptyForestState: React.FC<EmptyForestStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon = '🌲',
}) => {
  return (
    <div className="empty-forest-container">
      <div className="empty-forest-bg">
        <ForestEcosystem variant="empty" height={160} showParticles={true} showDataNodes={false} />
      </div>
      <div className="empty-forest-content">
        <div className="empty-forest-icon">{icon}</div>
        <h4 className="empty-forest-title">{title}</h4>
        <p className="empty-forest-desc">{description}</p>
        {actionText && onAction && (
          <button className="btn btn-primary btn-sm" onClick={onAction} style={{ marginTop: 12 }}>
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyForestState;
