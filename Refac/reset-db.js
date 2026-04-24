// Rensa IndexedDB för testning
// Kör detta i browser console för att rensa alla data

async function resetDatabase() {
    console.log('🗑️ Rensar databas...');
    
    // Stäng alla öppna anslutningar
    if (typeof indexedDB !== 'undefined') {
        const dbName = 'hetza-ra-db';
        
        // Radera databasen
        const request = indexedDB.deleteDatabase(dbName);
        
        request.onsuccess = function() {
            console.log('✅ Databasen raderad!');
            console.log('🔄 Laddar om sidan...');
            setTimeout(() => {
                location.reload();
            }, 500);
        };
        
        request.onerror = function() {
            console.error('❌ Kunde inte radera databasen');
        };
        
        request.onblocked = function() {
            console.warn('⚠️ Databasen är blockerad. Stäng alla andra flikar och försök igen.');
        };
    } else {
        console.error('❌ IndexedDB stöds inte');
    }
}

// Kör reset
resetDatabase();
