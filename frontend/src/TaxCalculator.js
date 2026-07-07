import { useState } from "react";

export default function TaxCalculator() {
  const [income, setIncome] = useState("");
  const [deductions80C, setDeductions80C] = useState("");
  const [deductions80D, setDeductions80D] = useState("");
  const [homeLoanInterest, setHomeLoanInterest] = useState("");
  const [result, setResult] = useState(null);

  const calculateTax = () => {
    const grossIncome = parseFloat(income) || 0;
    const ded80C = Math.min(parseFloat(deductions80C) || 0, 150000);
    const ded80D = Math.min(parseFloat(deductions80D) || 0, 25000);
    const homeloan = Math.min(parseFloat(homeLoanInterest) || 0, 200000);

    // ---- OLD REGIME ----
    const oldStandardDeduction = 50000;
    const oldTaxableIncome = Math.max(
      0,
      grossIncome - oldStandardDeduction - ded80C - ded80D - homeloan
    );

    const calculateOldTax = (income) => {
      let tax = 0;
      if (income <= 250000) tax = 0;
      else if (income <= 500000) tax = (income - 250000) * 0.05;
      else if (income <= 1000000) tax = 12500 + (income - 500000) * 0.2;
      else tax = 112500 + (income - 1000000) * 0.3;
      // Rebate 87A
      if (income <= 500000) tax = 0;
      return tax;
    };

    const oldTax = calculateOldTax(oldTaxableIncome);
    const oldCess = oldTax * 0.04;
    const oldTotal = oldTax + oldCess;

    // ---- NEW REGIME ----
    const newStandardDeduction = 75000;
    const newTaxableIncome = Math.max(0, grossIncome - newStandardDeduction);

    const calculateNewTax = (income) => {
      let tax = 0;
      if (income <= 300000) tax = 0;
      else if (income <= 700000) tax = (income - 300000) * 0.05;
      else if (income <= 1000000) tax = 20000 + (income - 700000) * 0.1;
      else if (income <= 1200000) tax = 50000 + (income - 1000000) * 0.15;
      else if (income <= 1500000) tax = 80000 + (income - 1200000) * 0.2;
      else tax = 140000 + (income - 1500000) * 0.3;
      // Rebate 87A — income up to 7 lakh is tax free
      if (income <= 700000) tax = 0;
      return tax;
    };

    const newTax = calculateNewTax(newTaxableIncome);
    const newCess = newTax * 0.04;
    const newTotal = newTax + newCess;

    const savings = Math.abs(oldTotal - newTotal);
    const betterRegime = oldTotal <= newTotal ? "Old Regime" : "New Regime";

    setResult({
      oldRegime: {
        taxableIncome: oldTaxableIncome,
        tax: oldTax,
        cess: oldCess,
        total: oldTotal,
      },
      newRegime: {
        taxableIncome: newTaxableIncome,
        tax: newTax,
        cess: newCess,
        total: newTotal,
      },
      savings,
      betterRegime,
    });
  };

  const formatINR = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>🧮 Tax Calculator FY 2024-25</h2>
      <p style={styles.subheading}>Compare Old vs New Tax Regime instantly</p>

      {/* Input Section */}
      <div style={styles.inputGrid}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Annual Gross Income (₹)</label>
          <input
            style={styles.input}
            type="number"
            placeholder="e.g. 1200000"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Section 80C Investments (₹)</label>
          <input
            style={styles.input}
            type="number"
            placeholder="Max 1,50,000"
            value={deductions80C}
            onChange={(e) => setDeductions80C(e.target.value)}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Section 80D Health Insurance (₹)</label>
          <input
            style={styles.input}
            type="number"
            placeholder="Max 25,000"
            value={deductions80D}
            onChange={(e) => setDeductions80D(e.target.value)}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Home Loan Interest (₹)</label>
          <input
            style={styles.input}
            type="number"
            placeholder="Max 2,00,000"
            value={homeLoanInterest}
            onChange={(e) => setHomeLoanInterest(e.target.value)}
          />
        </div>
      </div>

      <button style={styles.calculateBtn} onClick={calculateTax}>
        Calculate Tax 🧮
      </button>

      {/* Results */}
      {result && (
        <div style={styles.results}>
          {/* Winner Banner */}
          <div style={styles.winnerBanner}>
            ✅ <strong>{result.betterRegime}</strong> is better for you!
            You save <strong>{formatINR(result.savings)}</strong>
          </div>

          {/* Comparison Cards */}
          <div style={styles.comparisonGrid}>
            {/* Old Regime */}
            <div style={{
              ...styles.regimeCard,
              borderColor: result.betterRegime === "Old Regime" ? "#24a148" : "#e0e0e0",
              backgroundColor: result.betterRegime === "Old Regime" ? "#defbe6" : "white"
            }}>
              <h3 style={styles.regimeTitle}>
                Old Regime
                {result.betterRegime === "Old Regime" && " 🏆"}
              </h3>
              <div style={styles.taxRow}>
                <span>Taxable Income</span>
                <span>{formatINR(result.oldRegime.taxableIncome)}</span>
              </div>
              <div style={styles.taxRow}>
                <span>Income Tax</span>
                <span>{formatINR(result.oldRegime.tax)}</span>
              </div>
              <div style={styles.taxRow}>
                <span>Health & Education Cess (4%)</span>
                <span>{formatINR(result.oldRegime.cess)}</span>
              </div>
              <div style={styles.taxRowTotal}>
                <span>Total Tax</span>
                <span>{formatINR(result.oldRegime.total)}</span>
              </div>
            </div>

            {/* New Regime */}
            <div style={{
              ...styles.regimeCard,
              borderColor: result.betterRegime === "New Regime" ? "#24a148" : "#e0e0e0",
              backgroundColor: result.betterRegime === "New Regime" ? "#defbe6" : "white"
            }}>
              <h3 style={styles.regimeTitle}>
                New Regime
                {result.betterRegime === "New Regime" && " 🏆"}
              </h3>
              <div style={styles.taxRow}>
                <span>Taxable Income</span>
                <span>{formatINR(result.newRegime.taxableIncome)}</span>
              </div>
              <div style={styles.taxRow}>
                <span>Income Tax</span>
                <span>{formatINR(result.newRegime.tax)}</span>
              </div>
              <div style={styles.taxRow}>
                <span>Health & Education Cess (4%)</span>
                <span>{formatINR(result.newRegime.cess)}</span>
              </div>
              <div style={styles.taxRowTotal}>
                <span>Total Tax</span>
                <span>{formatINR(result.newRegime.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "24px",
    maxWidth: "800px",
    margin: "0 auto",
  },
  heading: {
    color: "#822222",
    margin: "0 0 4px 0",
    fontSize: "22px",
  },
  subheading: {
    color: "#6f6f6f",
    margin: "0 0 24px 0",
    fontSize: "13px",
  },
  inputGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#161616",
  },
  input: {
    padding: "10px 14px",
    border: "1px solid #8d8d8d",
    borderRadius: "6px",
    fontSize: "14px",
    outline: "none",
  },
  calculateBtn: {
    backgroundColor: "#822222",
    color: "white",
    border: "none",
    padding: "12px 32px",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "pointer",
    fontWeight: "bold",
    width: "100%",
    marginBottom: "24px",
  },
  results: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  winnerBanner: {
    backgroundColor: "#822222",
    color: "white",
    padding: "14px 20px",
    borderRadius: "8px",
    fontSize: "15px",
    textAlign: "center",
  },
  comparisonGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  regimeCard: {
    border: "2px solid",
    borderRadius: "10px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  regimeTitle: {
    margin: "0 0 8px 0",
    fontSize: "16px",
    color: "#161616",
  },
  taxRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#525252",
    borderBottom: "1px solid #e0e0e0",
    paddingBottom: "6px",
  },
  taxRowTotal: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "15px",
    fontWeight: "bold",
    color: "#161616",
    marginTop: "4px",
  },
};