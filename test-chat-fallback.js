// Test script to verify unique ID generation for fallback chat messages
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_BASE_URL = 'http://localhost:5000';
const CONCURRENT_REQUESTS = 500; // Number of simultaneous requests to send

/**
 * A simple assertion helper.
 * @param {boolean} condition - The condition to check.
 * @param {string} message - The error message to throw if the condition is false.
 */
function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

/**
 * Sends a single chat message request to the server.
 * @returns {Promise<object>} - The JSON response from the server.
 */
async function sendChatMessage() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/chat/message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: 'test-session-fallback-race-condition',
                message: 'This is a test message to trigger a fallback.',
            }),
        });
        if (!response.ok) {
            console.error(`   API request failed with status: ${response.status}`);
            const errorBody = await response.text();
            console.error(`   Response body: ${errorBody}`);
            // Re-throw to make sure the test fails clearly
            throw new Error(`API returned status ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error('   Network error during fetch:', error.message);
        // Re-throw to ensure the test fails if the server isn't running
        throw new Error(`Failed to connect to the server at ${API_BASE_URL}. Is it running?`);
    }
}

/**
 * Tests that fallback messages generated concurrently have unique IDs.
 */
async function testFallbackIdUniqueness() {
    console.log(`   Sending ${CONCURRENT_REQUESTS} concurrent chat requests...`);

    const requests = Array.from({ length: CONCURRENT_REQUESTS }, () => sendChatMessage());

    const responses = await Promise.all(requests);

    const ids = [];
    responses.forEach(data => {
        // The test relies on the fallback logic being triggered.
        // We collect both user and AI message IDs.
        if (data.userMessage && data.aiMessage) {
            ids.push(data.userMessage.id);
            ids.push(data.aiMessage.id);
        } else {
            console.warn('   Received an unexpected response format, ignoring:', data);
        }
    });

    console.log(`   Collected ${ids.length} fallback IDs from ${responses.length} responses.`);
    const uniqueIds = new Set(ids);

    assert(
        ids.length > 0,
        'Test did not collect any fallback IDs. Ensure the server is running with a failing database connection.'
    );

    assert(
        ids.length === uniqueIds.size,
        `Race condition detected! Found duplicate IDs. Collected ${ids.length} IDs, but only ${uniqueIds.size} were unique.`
    );

    console.log('   All fallback IDs are unique.');

    // New assertion: check that the IDs are sequential, proving the counter works.
    const sortedIds = [...ids].sort((a, b) => a - b);
    let isSequential = true;
    for (let i = 0; i < sortedIds.length - 1; i++) {
        if (sortedIds[i + 1] - sortedIds[i] !== 1) {
            isSequential = false;
            console.error(`   Non-sequential IDs found: ${sortedIds[i]} and ${sortedIds[i + 1]}`);
            break;
        }
    }

    assert(
        isSequential,
        'IDs are not sequential. The new incrementing counter is not working as expected.'
    );

    console.log('   All fallback IDs are sequential, confirming the fix.');
}

/**
 * Main function to run the test suite.
 */
async function main() {
    console.log('🚀 Starting Fallback ID Uniqueness Test...');
    console.log('--------------------------------------------------');
    console.log('NOTE: This test requires the server to be running with a');
    console.log('      failing database connection to trigger fallback logic.');
    console.log('--------------------------------------------------');

    try {
        await testFallbackIdUniqueness();
        console.log('\n✅ Test PASSED: Fallback ID generation is working correctly and is free of race conditions.');
        process.exit(0);
    } catch (error) {
        console.error(`\n❌ Test FAILED: ${error.message}`);
        process.exit(1);
    }
}

main().catch(error => {
    console.error('\nAn unexpected error occurred during the test run:', error);
    process.exit(1);
});