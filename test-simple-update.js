import fetch from 'node-fetch';

async function testBuildingUpdate() {
  console.log('🧪 Testing building update with ultra-simple server...');
  
  try {
    // 1. Test GET buildings
    console.log('1. Testing GET /api/buildings...');
    const getResponse = await fetch('http://localhost:3001/api/buildings', {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('GET Response status:', getResponse.status);
    if (getResponse.ok) {
      const buildings = await getResponse.json();
      console.log('✅ GET Success:', buildings);
      
      // 2. Test PUT building update
      console.log('\n2. Testing PUT /api/buildings/:id...');
      const buildingId = buildings[0].id;
      const putResponse = await fetch(`http://localhost:3001/api/buildings/${buildingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          name: 'Edificio Actualizado',
          description: 'Descripción actualizada'
        })
      });
      
      console.log('PUT Response status:', putResponse.status);
      if (putResponse.ok) {
        const result = await putResponse.json();
        console.log('✅ PUT Success:', result);
      } else {
        const errorText = await putResponse.text();
        console.log('❌ PUT Error:', errorText);
      }
    } else {
      const errorText = await getResponse.text();
      console.log('❌ GET Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testBuildingUpdate();
