import { formatCurrency, formatKhr, formatDual, toKhr, KHR_RATE } from '../src/utils/format.js';

console.log('--- Testing POS Currency & Format Helpers ---');
console.log('KHR_RATE:', KHR_RATE);

// Test 1: $1.00 should convert to 4,100 KHR
const khr1 = toKhr(1.0);
console.assert(khr1 === 4100, `Expected 4100, got ${khr1}`);

// Test 2: $0.40 (Yogurt from screenshot)
const khrYogurt = toKhr(0.40);
console.log('$0.40 in KHR:', formatKhr(0.40));
console.assert(khrYogurt === 1640, `Expected 1640, got ${khrYogurt}`);

// Test 3: Dual format
const dual = formatDual(12.50);
console.log('$12.50 dual format:', dual);
console.assert(dual.usd.includes('$12.50'), `Expected $12.50 in dual.usd`);
console.assert(dual.khr.includes('51,250'), `Expected 51,250 in dual.khr`);

// Test 4: Cambodian change calculation
const total = 3.25;
const tenderedUsd = 5.00;
const changeDueUsd = tenderedUsd - total;
const changeDueKhr = toKhr(changeDueUsd);
console.log('Total:', total, 'Tendered:', tenderedUsd, 'Change USD:', formatCurrency(changeDueUsd), 'Change KHR:', formatKhr(changeDueUsd));
console.assert(Math.abs(changeDueUsd - 1.75) < 0.001, `Expected 1.75`);
console.assert(changeDueKhr === 7175, `Expected 7175`);

console.log('✅ ALL POS FORMAT TESTS PASSED SUCCESSFULLY!');
