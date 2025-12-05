/**
 * SpotTheBall Component Exports
 * Clean exports for all game-related components
 */

// Main component
export { SpotTheBall } from './index';

// Sub-components
export { GameHeader } from './GameHeader';
export { GameImageCanvas } from './GameImageCanvas';
export { GameControls } from './GameControls';
export { CoordinateMarker } from './CoordinateMarker';
export { SuccessModal } from './SuccessModal';
export { ErrorToast } from './ErrorToast';

// Legacy component
export { default as MobileGameView } from './MobileGameView';

// Types
export * from './types';
