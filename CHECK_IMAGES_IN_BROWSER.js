// Paste this in browser DevTools Console (F12) to verify images are loaded

console.clear();
console.log('%c🔍 VERIFYING IMAGES IN DOM', 'color: blue; font-weight: bold; font-size: 16px');

// Check 1: Count img elements
const allImages = document.querySelectorAll('img');
console.log(`\n1️⃣ Total <img> tags: ${allImages.length}`);

// Check 2: Count perfume images
const perfumeImages = document.querySelectorAll('img[src*="perfume"]');
console.log(`2️⃣ Perfume images: ${perfumeImages.length}`);

// Check 3: Show status of first few images
if (perfumeImages.length > 0) {
  console.log(`\n3️⃣ First 3 images status:`);
  Array.from(perfumeImages).slice(0, 3).forEach((img, i) => {
    const loaded = img.complete && img.naturalHeight > 0;
    const status = loaded ? '✅ LOADED' : (img.src ? '⏳ LOADING' : '❌ NO SRC');
    const srcPreview = img.src?.substring(0, 50) || 'NO SRC';
    console.log(`  [${i}] ${status} - ${srcPreview}`);
  });
}

// Check 4: Look for placeholders (means images didn't load) 
const svgPlaceholders = document.querySelectorAll('svg');
console.log(`\n4️⃣ SVG placeholders (fallback icons): ${svgPlaceholders.length}`);

// Check 5: Look for 🖼️ and ❌ debug indicators
const cardDebugText = document.body.innerText;
const hasImageIndicators = cardDebugText.includes('🖼️') || cardDebugText.includes('❌');
console.log(`5️⃣ Debug image indicators visible: ${hasImageIndicators ? '✅ YES' : '❌ NO'}`);

console.log('\n' + '='.repeat(50));
if (perfumeImages.length >= 5) {
  console.log('✅ IMAGES SEEM TO BE PRESENT - Check visual display');
} else {
  console.log('❌ Image loading may have failed - Check logs above');
}
