// Simple test to check if user/slots API works
const testSlotsAPI = async () => {
  try {
    // First get available packages  
    console.log("Testing packages API...");
    const packagesResponse = await fetch('http://localhost:5000/api/admin/packages');
    const packagesData = await packagesResponse.json();
    console.log("Packages:", packagesData);

    if (packagesData.length > 0) {
      const testPackage = packagesData[0];
      console.log("Using package:", testPackage.name, testPackage._id);

      // Now get slots for this package
      console.log("Testing slots API for package:", testPackage._id);
      const slotsResponse = await fetch(`http://localhost:5000/api/user/slots/${testPackage._id}`);
      const slotsData = await slotsResponse.json();
      console.log("Slots response:", slotsData);
    }
  } catch (error) {
    console.error("Error testing APIs:", error);
  }
};

testSlotsAPI();