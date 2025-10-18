// EMICalculator.tsx
import React, { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartTooltip,
} from "recharts";
import PropertyAction from "../components/PropertyAction";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { PieChartIcon } from "lucide-react";
import headerImg from "../images/Banners/EMI-calculator.png";

export default function EMICalculator(): React.ReactElement {
  // Constraints
  const MAX_LOAN = 100_000_000; // 10 Crore (in rupees)
  const MAX_RATE = 30; // percent
  const MAX_TENURE = 30; // years

  // Defaults
  const DEFAULT_LOAN = 10_000_000; // 1 Crore (10,000,000)
  const DEFAULT_TENURE = 5; // years
  const DEFAULT_RATE = 6.5; // percent

  const [loanAmount, setLoanAmount] = useState<number>(DEFAULT_LOAN);
  const [annualRate, setAnnualRate] = useState<number>(DEFAULT_RATE);
  const [tenureYears, setTenureYears] = useState<number>(DEFAULT_TENURE);

  const formatINR = (value: number) =>
    value.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });

  const toPercent = (value: number, min: number, max: number) =>
    Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  const { emi, totalPayment, totalInterest, monthlyRate, months } = useMemo(() => {
    const months = Math.round(tenureYears * 12);
    const monthlyRate = annualRate / 12 / 100;

    if (monthlyRate === 0) {
      const emi = loanAmount / months;
      const totalPayment = loanAmount;
      const totalInterest = 0;
      return { emi, totalPayment, totalInterest, monthlyRate, months };
    }

    const r = monthlyRate;
    const n = months;
    const P = loanAmount;

    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    return { emi, totalPayment, totalInterest, monthlyRate, months };
  }, [loanAmount, annualRate, tenureYears]);

  const chartData = [
    { name: "Principal", value: Math.round(loanAmount) },
    { name: "Interest", value: Math.round(totalInterest) },
  ];

  const COLORS = ["#fb923c", "#f97316"]; // orange shades
  const loanPercent = toPercent(loanAmount, 10000, MAX_LOAN); 
  const ratePercent = toPercent(annualRate, 0, MAX_RATE);
  const tenurePercent = toPercent(tenureYears, 1, MAX_TENURE);

  return (
    <div>
        <Header headerImage={headerImg} />
    
    <div className="min-h-screen bg-white p-6 sm:p-8 lg:p-12">
        
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Controls */}
          <div className="p-6 md:p-8 lg:p-10">
            {/* <h1 className="text-2xl sm:text-3xl font-semibold text-orange-600">EMI CALCULATOR</h1> */}
            <p className="mt-2 text-md font-bold text-orange-600">Estimate your monthly EMI, total interest and payment schedule.</p>

            <div className="mt-6 space-y-6">
              {/* Loan Amount */}
              <div>
                <label className="text-sm font-medium text-gray-700">Loan amount</label>
                <div className="mt-2 flex items-center gap-4">
                  <input
                    type="number"
                    min={1000}
                    max={MAX_LOAN}
                    value={Math.round(loanAmount)}
                    onChange={(e) => setLoanAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full rounded-lg border border-orange-200 p-3 text-lg shadow-sm"
                  />
                  {/* <div className="text-right text-sm text-gray-500 whitespace-nowrap">Max: {formatINR(MAX_LOAN)}</div> */}
                </div>
                <input
                  type="range"
                  min={10000}
                  max={MAX_LOAN}
                  step={10000}
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="custom-range mt-3 w-full h-2 rounded-full" // tailwind for sizing/spacing
                    style={{
                        background: `linear-gradient(90deg, #f97316 ${loanPercent}%, #e5e7eb ${loanPercent}%)`,
                    }}
                />
              </div>

              {/* Interest Rate */}
              <div>
                <label className="text-sm font-medium text-gray-700">Interest rate (annual %)</label>
                <div className="mt-2 flex items-center gap-4">
                  <input
                    type="number"
                    min={0}
                    max={MAX_RATE}
                    step={0.01}
                    value={annualRate}
                    onChange={(e) => setAnnualRate(Number(e.target.value))}
                    className="w-32 rounded-lg border border-orange-200 p-3 text-lg shadow-sm"
                  />
                  <div className="flex-1">
                    <input
                      type="range"
                      min={0}
                      max={MAX_RATE}
                      step={0.01}
                      value={annualRate}
                      onChange={(e) => setAnnualRate(Number(e.target.value))}
                      className="custom-range w-full h-2 rounded-full"
                      style={{ background: `linear-gradient(90deg, #f97316 ${ratePercent}%, #e5e7eb ${ratePercent}%)` }}
                    />
                  </div>
                  {/* <div className="text-sm text-gray-500">Max: {MAX_RATE}%</div> */}
                </div>
              </div>

              {/* Tenure */}
              <div>
                <label className="text-sm font-medium text-gray-700">Tenure (years)</label>
                <div className="mt-2 flex items-center gap-4">
                  <input
                    type="number"
                    min={1}
                    max={MAX_TENURE}
                    value={tenureYears}
                    onChange={(e) => setTenureYears(Math.max(1, Number(e.target.value)))}
                    className="w-28 rounded-lg border border-orange-200 p-3 text-lg shadow-sm"
                  />
                  <div className="flex-1">
                    <input
                      type="range"
                      min={1}
                      max={MAX_TENURE}
                      step={1}
                      value={tenureYears}
                      onChange={(e) => setTenureYears(Number(e.target.value))}
                      className="custom-range w-full h-2 rounded-full"
                      style={{ background: `linear-gradient(90deg, #f97316 ${tenurePercent}%, #e5e7eb ${tenurePercent}%)` }}
                    />
                  </div>
                  {/* <div className="text-sm text-gray-500">Max: {MAX_TENURE} yrs</div> */}
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border border-orange-100 bg-orange-50 transition duration-300 hover:shadow-lg hover:scale-[1.03]">
                  <div className="text-sm text-gray-600">Monthly EMI</div>
                  <div className="mt-2 text-xl font-semibold text-orange-600">
                    {emi ? emi.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }) : "-"}
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-orange-100 bg-orange-50 transition duration-300 hover:shadow-lg hover:scale-[1.03]">
                  <div className="text-sm text-gray-600">Total Interest</div>
                  <div className="mt-2 text-xl font-semibold text-orange-600">{formatINR(Math.round(totalInterest))}</div>
                </div>

                <div className="p-4 rounded-lg border border-orange-100 bg-orange-50 transition duration-300 hover:shadow-lg hover:scale-[1.03]">
                  <div className="text-sm text-gray-600">Total Payment</div>
                  <div className="mt-2 text-xl font-semibold text-orange-600">{formatINR(Math.round(totalPayment))}</div>
                </div>
              </div>
            </div>

            {/* <p className="mt-6 text-xs text-gray-500">
              Defaults — Loan amount: {formatINR(DEFAULT_LOAN)}, Tenure: {DEFAULT_TENURE} years, Rate: {DEFAULT_RATE}%
            </p> */}
          </div>

          {/* Chart + Details */}
          <div className="p-6 md:p-8 lg:p-10 border-l border-gray-50">
            <div className="flex flex-col h-full mt-8">
              <div className="flex items-center justify-between">
                <h3 className="flex rounded-xl border-2 border-orange-600 text-lg font-bold bg-orange-50 px-3 py-3 text-orange-600"><PieChartIcon className="mr-2" />Breakdown</h3>
                <div className="text-sm text-orange-500">Tenure: {tenureYears} yrs • {months} months</div>
              </div>

              <div className="flex-1 mt-4">
                <div className="w-full h-64 sm:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        dataKey="value"
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        // Recharts label typing varies by version; props typed as `any` here safely
                        label={(props: any) => {
                          const name = String(props?.name ?? "");
                          const percent = typeof props?.percent === "number" ? props.percent : 0;
                          return `${name}: ${(percent * 100).toFixed(0)}%`;
                        }}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartTooltip formatter={(value: any) => formatINR(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-orange-500 border border-orange-500 transition duration-300 hover:shadow-lg hover:scale-[1.03]">
                    <div className="text-sm text-white">Principal amount</div>
                    <div className="mt-2 text-xl font-bold text-white">{formatINR(Math.round(loanAmount))}</div>
                  </div>

                  <div className="p-4 rounded-lg bg-orange-500 border border-orange-500 transition duration-300 hover:shadow-lg hover:scale-[1.03]">
                    <div className="text-sm text-white">Total interest</div>
                    <div className="mt-2 text-xl font-bold text-white">{formatINR(Math.round(totalInterest))}</div>
                  </div>
                </div>

                {/* <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700">Amortization (first 12 months)</h4>
                  <div className="mt-2 text-xs text-gray-500">Monthly breakdown of principal vs interest (first 12 months)</div>

                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-sm table-auto">
                      <thead>
                        <tr className="text-left text-gray-600">
                          <th className="px-2 py-2">Month</th>
                          <th className="px-2 py-2">EMI</th>
                          <th className="px-2 py-2">Principal</th>
                          <th className="px-2 py-2">Interest</th>
                          <th className="px-2 py-2">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const rows = [];
                          let balance = loanAmount;
                          const n = Math.min(months, 12);
                          for (let i = 1; i <= n; i++) {
                            const interestForMonth = balance * monthlyRate;
                            const principalForMonth = emi - interestForMonth;
                            balance = balance - principalForMonth;
                            rows.push(
                              <tr key={i} className="border-t">
                                <td className="px-2 py-2">{i}</td>
                                <td className="px-2 py-2">
                                  {emi.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
                                </td>
                                <td className="px-2 py-2">
                                  {Math.max(0, Math.round(principalForMonth)).toLocaleString("en-IN", {
                                    style: "currency",
                                    currency: "INR",
                                    maximumFractionDigits: 0,
                                  })}
                                </td>
                                <td className="px-2 py-2">
                                  {Math.max(0, Math.round(interestForMonth)).toLocaleString("en-IN", {
                                    style: "currency",
                                    currency: "INR",
                                    maximumFractionDigits: 0,
                                  })}
                                </td>
                                <td className="px-2 py-2">
                                  {(balance > 0 ? Math.round(balance) : 0).toLocaleString("en-IN", {
                                    style: "currency",
                                    currency: "INR",
                                    maximumFractionDigits: 0,
                                  })}
                                </td>
                              </tr>
                            );
                          }
                          return rows;
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div> */}
              </div>

              {/* <div className="mt-6 text-xs text-gray-500">Max loan: {formatINR(MAX_LOAN)} • Max rate: {MAX_RATE}% • Max tenure: {MAX_TENURE} yrs</div> */}
            </div>
          </div>
        </div>
      </div>
      </div>
      <PropertyAction />
      <Footer />
    </div>
  );
}
