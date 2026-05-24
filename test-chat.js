const testReq = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Can you please show me the calculation of NPV",
        data: {
          customerName: "Test",
          transformerRating: 50,
          voltageClass: 132,
          oilVolume: 10000,
          analysisYears: 30,
          discountRate: 10
        },
        comparison: {
          bestValue: "Natural Ester",
          naturalSavings: 20000000,
          naturalPayback: 0.3,
          naturalBenefitCostRatio: 1.01
        },
        targetOil: "Natural Ester"
      })
    });
    const text = await res.text();
    console.log("RESPONSE:", text);
  } catch (err) {
    console.error("FETCH ERROR:", err);
  }
};
testReq();
