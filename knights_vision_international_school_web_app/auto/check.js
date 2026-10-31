const fetchResults = async (roll, number, year, attempt) => {
    // Construct the API URL with query parameters
    const apiUrl = `https://wbresults.nic.in/api/madhyamik/results?roll=${roll}&number=${number}&year=${year}`;
  
    try {
      // Make the GET request using Fetch API
      const response = await fetch(apiUrl);
  
      // Check if the response is successful
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
  
      // Parse the JSON response
      const data = await response.json();
  
      return { attempt, roll, number, status: "success", data };
    } catch (error) {
      // Handle errors
      return { attempt, roll, number, status: "error", error: error.message };
    }
  };
  
  // Delay function to add a pause between requests (in milliseconds)
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  // Main function to hit the API 1000 times
  const fetchResultsMultipleTimes = async () => {
    const students = [
      { roll: "205762", number: "0068", year: "2025" }, // Sayaba Akhtara Yunus Ali
      { roll: "205762", number: "0069", year: "2025" }  // Suhana Parvin Danesh Sk
    ];
  
    const totalRequests = 1000;
    const delayBetweenRequests = 100; // 100ms delay to avoid rate limiting
    const results = [];
  
    console.log(`Starting ${totalRequests} API requests...`);
  
    for (let i = 0; i < totalRequests; i++) {
      // Alternate between the two students
      const student = students[i % students.length];
      const attempt = i + 1;
  
      // Fetch the result
      const result = await fetchResults(student.roll, student.number, student.year, attempt);
      results.push(result);
  
      // Log progress every 100 requests
      if (attempt % 100 === 0) {
        console.log(`Completed ${attempt} requests...`);
      }
  
      // Add a delay between requests to avoid overwhelming the server
      await delay(delayBetweenRequests);
    }
  
    // Summarize the results
    const successfulRequests = results.filter(r => r.status === "success").length;
    const failedRequests = results.filter(r => r.status === "error").length;
  
    console.log(`Summary:`);
    console.log(`Total Requests: ${totalRequests}`);
    console.log(`Successful Requests: ${successfulRequests}`);
    console.log(`Failed Requests: ${failedRequests}`);
  
    // Log details of failed requests (if any)
    const failedDetails = results.filter(r => r.status === "error");
    if (failedDetails.length > 0) {
      console.log("Failed Requests Details:", failedDetails);
    }
  
    // Log a sample of successful results (first 5 to avoid flooding the console)
    const successfulResults = results.filter(r => r.status === "success").slice(0, 5);
    console.log("Sample Successful Results (First 5):", successfulResults);
  
    return results;
  };
  
  // Run the function
  fetchResultsMultipleTimes();