#!/usr/bin/env ts-node

/**
 * Contract State Checker
 * 
 * This script checks the current state of your game contract to help debug
 * why transactions might be reverting.
 * 
 * Usage:
 *   npx ts-node scripts/check-contract-state.ts
 */

import { createPublicClient, http } from 'viem';
import { worldchain } from 'viem/chains';
import GameABI from '../src/abi/gameABI.js';

// You'll need to set your contract address
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x12b2ffe168aef63dffcf97b3ba2ffbbd1886f321';

const client = createPublicClient({
  chain: worldchain,
  transport: http(
    'https://worldchain-mainnet.g.alchemy.com/v2/-Ni_mubLyV7sEw_-C0t2JLrbmanltv0f'
  ),
});

async function checkContractState() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 CHECKING CONTRACT STATE');
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔗 Contract Address:', CONTRACT_ADDRESS);
  console.log('⛓️  Chain: Worldchain');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');

  try {
    console.log('📡 Fetching contract data...');
    console.log('');

    const [gameStatus, mintPrice, prizePool, nft, owner, winningX, winningY] = await Promise.all([
      client.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: GameABI,
        functionName: 'gameStatus',
      }),
      client.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: GameABI,
        functionName: 'mintPrice',
      }),
      client.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: GameABI,
        functionName: 'prizePool',
      }),
      client.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: GameABI,
        functionName: 'nft',
      }),
      client.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: GameABI,
        functionName: 'owner',
      }),
      client.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: GameABI,
        functionName: 'winningXPoint',
      }),
      client.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: GameABI,
        functionName: 'winningYPoint',
      }),
    ]);

    // Analyze game status
    const statusNum = Number(gameStatus);
    let statusLabel = 'UNKNOWN';
    let statusEmoji = '⚪';
    let canPlay = false;
    let statusMessage = '';

    switch (statusNum) {
      case 0:
        statusLabel = 'NOT STARTED';
        statusEmoji = '⚪';
        canPlay = false;
        statusMessage = '❌ Game has not been started yet. Owner needs to call startGame().';
        break;
      case 1:
        statusLabel = 'STARTED (ACTIVE)';
        statusEmoji = '🟢';
        canPlay = true;
        statusMessage = '✅ Game is active and accepting plays!';
        break;
      case 2:
        statusLabel = 'STOPPED';
        statusEmoji = '🟡';
        canPlay = false;
        statusMessage = '❌ Game is stopped. No more plays accepted.';
        break;
      case 3:
        statusLabel = 'CLAIM (ENDED)';
        statusEmoji = '🔴';
        canPlay = false;
        statusMessage = '❌ Game has ended. Winners can claim prizes.';
        break;
    }

    // Analyze NFT contract
    const nftAddress = nft as string;
    const nftIsSet = nftAddress !== '0x0000000000000000000000000000000000000000';

    // Analyze mint price
    const price = mintPrice as bigint;
    const priceInWLD = Number(price) / 1e18;

    // Analyze prize pool
    const pool = prizePool as bigint;
    const poolInWLD = Number(pool) / 1e18;

    // Display results
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅  CONTRACT STATE ANALYSIS');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');

    console.log('🎮 GAME STATUS');
    console.log('   Raw Value:', statusNum);
    console.log('   Status:', statusEmoji, statusLabel);
    console.log('   Can Play:', canPlay ? 'YES ✅' : 'NO ❌');
    console.log('   Message:', statusMessage);
    console.log('');

    console.log('💰 FINANCIAL DETAILS');
    console.log('   Mint Price:', priceInWLD, 'WLD');
    console.log('   Mint Price (wei):', price.toString());
    console.log('   Prize Pool:', poolInWLD, 'WLD');
    console.log('   Prize Pool (wei):', pool.toString());
    console.log('');

    console.log('🎨 NFT CONTRACT');
    console.log('   Address:', nftAddress);
    console.log('   Is Set:', nftIsSet ? 'YES ✅' : 'NO ❌ (This will cause reverts!)');
    console.log('');

    console.log('🎯 WINNING COORDINATES');
    console.log('   X Point:', Number(winningX));
    console.log('   Y Point:', Number(winningY));
    console.log('   Are Set:', Number(winningX) > 0 || Number(winningY) > 0 ? 'YES' : 'NO');
    console.log('');

    console.log('👤 CONTRACT OWNER');
    console.log('   Address:', owner);
    console.log('');

    // Validation checks
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔍 VALIDATION CHECKS');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');

    const checks = [];

    // Check 1: Game status
    if (canPlay) {
      checks.push({ check: 'Game Status', status: '✅ PASS', message: 'Game is active' });
    } else {
      checks.push({ 
        check: 'Game Status', 
        status: '❌ FAIL', 
        message: `Game is ${statusLabel}. Transactions will REVERT.` 
      });
    }

    // Check 2: NFT contract
    if (nftIsSet) {
      checks.push({ check: 'NFT Contract', status: '✅ PASS', message: 'NFT contract is set' });
    } else {
      checks.push({ 
        check: 'NFT Contract', 
        status: '❌ FAIL', 
        message: 'NFT contract not set. Transactions will REVERT.' 
      });
    }

    // Check 3: Mint price
    if (price > 0n) {
      checks.push({ check: 'Mint Price', status: '✅ PASS', message: `Entry fee is ${priceInWLD} WLD` });
    } else {
      checks.push({ 
        check: 'Mint Price', 
        status: '⚠️  WARN', 
        message: 'Mint price is 0. Free to play but may indicate misconfiguration.' 
      });
    }

    // Check 4: Prize pool
    if (pool > 0n) {
      checks.push({ check: 'Prize Pool', status: '✅ PASS', message: `Prize pool is ${poolInWLD} WLD` });
    } else {
      checks.push({ 
        check: 'Prize Pool', 
        status: '⚠️  WARN', 
        message: 'Prize pool is 0. No prizes available yet.' 
      });
    }

    // Print checks
    checks.forEach(({ check, status, message }) => {
      console.log(`${status} ${check}`);
      console.log(`   ${message}`);
      console.log('');
    });

    // Overall verdict
    const allPassed = checks.every(c => c.status.includes('✅'));
    const anyFailed = checks.some(c => c.status.includes('❌'));

    console.log('═══════════════════════════════════════════════════════');
    if (allPassed) {
      console.log('✅  ALL CHECKS PASSED - GAME IS READY TO PLAY!');
    } else if (anyFailed) {
      console.log('❌  CRITICAL ISSUES FOUND - TRANSACTIONS WILL REVERT');
      console.log('');
      console.log('📋 ACTION REQUIRED:');
      console.log('   1. Game owner must fix the issues above');
      console.log('   2. Ensure game status is STARTED (1)');
      console.log('   3. Ensure NFT contract is set (not 0x0000...)');
      console.log('   4. Try again after fixes are applied');
    } else {
      console.log('⚠️   SOME WARNINGS - Game may work but check above');
    }
    console.log('═══════════════════════════════════════════════════════');
    console.log('');

    // Export as JSON for debugging
    console.log('📄 Raw JSON Data (for debugging):');
    console.log(JSON.stringify({
      contractAddress: CONTRACT_ADDRESS,
      gameStatus: {
        raw: statusNum,
        label: statusLabel,
        canPlay,
      },
      mintPrice: {
        wei: price.toString(),
        wld: priceInWLD,
      },
      prizePool: {
        wei: pool.toString(),
        wld: poolInWLD,
      },
      nft: {
        address: nftAddress,
        isSet: nftIsSet,
      },
      owner: owner,
      winningCoordinates: {
        x: Number(winningX),
        y: Number(winningY),
      },
    }, null, 2));
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ ERROR READING CONTRACT');
    console.error('═══════════════════════════════════════════════════════');
    console.error('Error:', error);
    console.error('');
    console.error('Possible causes:');
    console.error('   1. Contract address is incorrect');
    console.error('   2. Contract is not deployed on Worldchain');
    console.error('   3. RPC endpoint is down');
    console.error('   4. Network connectivity issues');
    console.error('═══════════════════════════════════════════════════════');
    console.error('');
  }
}

// Run the check
checkContractState()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
