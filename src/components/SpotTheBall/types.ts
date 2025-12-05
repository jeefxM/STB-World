/**
 * Spot The Ball Game - TypeScript Type Definitions
 * Mobile-first game interface types
 */

// Coordinate types
export interface Coordinate {
  x: number;
  y: number;
}

// Image dimension tracking
export interface ImageDimensions {
  natural: { width: number; height: number };
  rendered: { width: number; height: number };
  offset: { x: number; y: number };
  scale: { x: number; y: number };
}

// Game status enum matching smart contract
// Contract enum: NotStarted=0, Started=1, Stopped=2, Claim=3
export enum GameStatus {
  NotStarted = 0,  // Game not yet started
  Started = 1,     // Game is active and accepting plays
  Stopped = 2,     // Game stopped but not yet in claim phase
  Claim = 3,       // Game ended, prizes can be claimed
}

// Transaction states for UI feedback
export type TransactionState =
  | 'idle'
  | 'pending'
  | 'confirming'
  | 'success'
  | 'error';

// Game data from Supabase
export interface GameData {
  contractAddress: `0x${string}` | null;
  imageUrl: string;
  title: string;
  description: string;
  gameName: string;
}

// Contract data read from blockchain
export interface ContractData {
  mintPrice: bigint | null;
  prizePool: bigint | null;
  gameStatus: GameStatus | null;
  guessCount: number | null;
}

// Props for GameHeader component
export interface GameHeaderProps {
  prizePool: bigint | null;
  mintPrice: bigint | null;
  gameStatus: GameStatus | null;
  paymentToken?: string | null;
  isLoading?: boolean;
}

// Props for GameImageCanvas component
export interface GameImageCanvasProps {
  imageUrl: string;
  coord: Coordinate | null;
  onCoordSelect: (coord: Coordinate) => void;
  isDisabled: boolean;
  gameStatus: GameStatus | null;
}

// Props for CoordinateMarker component
export interface CoordinateMarkerProps {
  coord: Coordinate;
  imageDimensions: ImageDimensions;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

// Props for GameControls component
export interface GameControlsProps {
  coord: Coordinate | null;
  onSubmit: () => void;
  onReset: () => void;
  mintPrice: bigint | null;
  transactionState: TransactionState;
  gameStatus: GameStatus | null;
  isDisabled: boolean;
}

// Props for SuccessModal component
export interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayAgain: () => void;
  transactionHash: string | null;
}

// Props for main SpotTheBall component
export interface SpotTheBallProps {
  gameId?: string;
}

// Utility type for formatting ETH values
export type FormatEthOptions = {
  decimals?: number;
  showSymbol?: boolean;
};

// Touch event data for mobile interaction
export interface TouchData {
  clientX: number;
  clientY: number;
  target: EventTarget | null;
}
