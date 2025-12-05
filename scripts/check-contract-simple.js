/**
 * Simple Contract State Checker
 * 
 * Run with: node scripts/check-contract-simple.js
 */

const { createPublicClient, http } = require('viem');
const { worldchain } = require('viem/chains');

const GameABI = [
  {
    type: 'function',
    name: 'gameStatus',
    inputs: [],
    outputs: [{ name: '', type: 'uint8', internalType: 'enum Game.GameStatus' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'mintPrice',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'prizePool',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'nft',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
];

const CONTRACT_ADDRESS = '0x12b2ffe168aef63dffcf97b3ba2ffbbd1886f321';

const client = createPublicClient({
  chain: worldchain,
  transport: http(
    'https://worldchain-mainnet.g.alchemy.com/v2/-Ni_mubLyV7sEw_-C0t2JLrbmanltv0f'
  ),
});

async function checkContract() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 CHECKING CONTRACT STATE');
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔗 Contract:', CONTRACT_ADDRESS);
  console.log('\n');

  try {
    const [gameStatus, mintPrice, prizePool, nft, owner] = await Promise.all([
      client.readContract({
        address: CONTRACT_ADDRESS,
        abi: GameABI,
        functionName: 'gameStatus',
      }),
      client.readContract({
        address: CONTRACT_ADDRESS,
        abi: GameABI,
        functionName: 'mintPrice',
      }),
      client.readContract({
        address: CONTRACT_ADDRESS,
        abi: GameABI,
        functionName: 'prizePool',
      }),
      client.readContract({
        address: CONTRACT_ADDRESS,
        abi: GameABI,
        functionName: 'nft',
      }),
      client.readContract({
        address: CONTRACT_ADDRESS,
        abi: GameABI,
        functionName: 'owner',
      }),
    ]);

    const statusNum = Number(gameStatus);
    const statusLabels = ['NOT STARTED', 'STARTED (ACTIVE)', 'STOPPED', 'CLAIM (ENDED)'];
    const statusEmojis = ['⚪', '🟢', '🟡', '🔴'];
    const canPlay = statusNum === 1;

    console.log('🎮 GAME STATUS');
    console.log('   Raw Value:', statusNum);
    console.log('   Status:', statusEmojis[statusNum], statusLabels[statusNum]);
    console.log('   Can Play:', canPlay ? 'YES ✅' : 'NO ❌');
    console.log('');

    const priceInWLD = Number(mintPrice) / 1e18;
    const poolInWLD = Number(prizePool) / 1e18;

    console.log('💰 FINANCIAL');
    console.log('   Mint Price:', priceInWLD, 'WLD');
    console.log('   Prize Pool:', poolInWLD, 'WLD');
    console.log('');

    const nftIsSet = nft !== '0x0000000000000000000000000000000000000000';
    console.log('🎨 NFT CONTRACT');
    console.log('   Address:', nft);
    console.log('   Is Set:', nftIsSet ? 'YES ✅' : 'NO ❌');
    console.log('');

    console.log('👤 OWNER');
    console.log('   Address:', owner);
    console.log('');

    console.log('═══════════════════════════════════════════════════════');
    console.log('🔍 DIAGNOSIS');
    console.log('═══════════════════════════════════════════════════════\n');

    if (!canPlay) {
      console.log('❌ GAME IS NOT ACTIVE');
      console.log(`   Current status: ${statusLabels[statusNum]}`);
      console.log('   Transactions will REVERT!');
      console.log('   \n   Solution: Game owner must call startGame()\n');
    } else {
      console.log('✅ Game status is ACTIVE\n');
    }

    if (!nftIsSet) {
      console.log('❌ NFT CONTRACT NOT SET');
      console.log('   Current NFT address: 0x0000...');
      console.log('   Transactions will REVERT!');
      console.log('   \n   Solution: Game owner must call startGame() with valid NFT address\n');
    } else {
      console.log('✅ NFT contract is set\n');
    }

    if (canPlay && nftIsSet) {
      console.log('\n🎉 CONTRACT IS READY! You can submit guesses.\n');
    } else {
      console.log('\n⚠️  CONTRACT HAS ISSUES - Guesses will revert until fixed!\n');
    }

    console.log('═══════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nContract may not exist at this address.\n');
  }
}

checkContract().catch(console.error);
