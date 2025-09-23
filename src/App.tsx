import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, FileText, DollarSign, Calendar, Percent } from 'lucide-react';

interface AmortizationRow {
  month: number;
  openingBalance: number;
  emiExGst: number;
  interest: number;
  principal: number;
  gstOnInterest: number;
  emiWithGst: number;
  closingBalance: number;
}

interface CalculationResults {
  monthlyEmi: number;
  processingFeeAmount: number;
  gstOnProcessingFee: number;
  totalInterest: number;
  totalGst: number;
  totalPaid: number;
  amortizationSchedule: AmortizationRow[];
}

function App() {
  const [inputs, setInputs] = useState({
    principal: 1000000,
    annualRate: 12,
    tenureMonths: 24,
    gstRate: 18,
    processingFeeRate: 1
  });

  const [results, setResults] = useState<CalculationResults | null>(null);
  const [animateValues, setAnimateValues] = useState(false);

  const calculateEMI = () => {
    const { principal, annualRate, tenureMonths, gstRate, processingFeeRate } = inputs;
    
    // Monthly interest rate
    const monthlyRate = annualRate / 12 / 100;
    
    // EMI calculation (excluding GST)
    const emiExGst = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
                     (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    
    // Processing fee
    const processingFeeAmount = (principal * processingFeeRate) / 100;
    
    // GST on processing fee
    const gstOnProcessingFee = (processingFeeAmount * gstRate) / 100;
    
    // Generate amortization schedule
    const schedule: AmortizationRow[] = [];
    let balance = principal;
    let totalInterest = 0;
    let totalGst = 0;
    
    for (let month = 1; month <= tenureMonths; month++) {
      const interest = balance * monthlyRate;
      const principalPayment = emiExGst - interest;
      const gstOnInterest = (interest * gstRate) / 100;
      const emiWithGst = emiExGst + gstOnInterest;
      
      schedule.push({
        month,
        openingBalance: balance,
        emiExGst,
        interest,
        principal: principalPayment,
        gstOnInterest,
        emiWithGst,
        closingBalance: balance - principalPayment
      });
      
      balance -= principalPayment;
      totalInterest += interest;
      totalGst += gstOnInterest;
    }
    
    const totalPaid = (emiExGst * tenureMonths) + totalGst + processingFeeAmount + gstOnProcessingFee;
    
    setResults({
      monthlyEmi: emiExGst,
      processingFeeAmount,
      gstOnProcessingFee,
      totalInterest,
      totalGst,
      totalPaid,
      amortizationSchedule: schedule
    });
    
    setAnimateValues(true);
    setTimeout(() => setAnimateValues(false), 800);
  };

  useEffect(() => {
    calculateEMI();
  }, [inputs]);

  const handleInputChange = (field: string, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      maximumFractionDigits: 0
    }).format(amount).replace(/^/, '₹');
  };

  const AnimatedValue = ({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) => (
    <span className={`transition-all duration-500 ${animateValues ? 'scale-110 text-blue-600' : ''}`}>
      {prefix}{typeof value === 'number' && !isNaN(value) ? formatCurrency(value) : '₹0'}{suffix}
    </span>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white">
              <Calculator className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Credit Card Loan EMI Calculator
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Calculate your loan EMI with detailed amortization schedule</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                Loan Details
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Principal Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={inputs.principal}
                    onChange={(e) => handleInputChange('principal', Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter principal amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.annualRate}
                    onChange={(e) => handleInputChange('annualRate', Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter interest rate"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tenure (Months)
                  </label>
                  <input
                    type="number"
                    value={inputs.tenureMonths}
                    onChange={(e) => handleInputChange('tenureMonths', Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter tenure in months"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GST on Interest (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.gstRate}
                    onChange={(e) => handleInputChange('gstRate', Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Default: 18%"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Processing Fee on Principal (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.processingFeeRate}
                    onChange={(e) => handleInputChange('processingFeeRate', Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Default: 1%"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className="lg:col-span-2 space-y-6">
            {results && (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Monthly EMI</h3>
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <p className="text-2xl md:text-3xl font-bold">
                      <AnimatedValue value={results.monthlyEmi} />
                    </p>
                    <p className="text-green-100 text-sm mt-2">EMI (ex-GST)</p>
                  </div>

                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Processing Fee</h3>
                      <Percent className="w-6 h-6" />
                    </div>
                    <p className="text-2xl md:text-3xl font-bold">
                      <AnimatedValue value={results.processingFeeAmount} />
                    </p>
                    <p className="text-orange-100 text-sm mt-2">+ {formatCurrency(results.gstOnProcessingFee)} GST</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-indigo-600" />
                    Payment Summary
                  </h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                      <p className="text-sm text-green-600 font-medium mb-2">Monthly EMI</p>
                      <p className="text-lg md:text-xl font-bold text-green-800">
                        <AnimatedValue value={results.monthlyEmi} />
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-orange-50 rounded-xl">
                      <p className="text-sm text-orange-600 font-medium mb-2">Processing Fee</p>
                      <p className="text-lg md:text-xl font-bold text-orange-800">
                        <AnimatedValue value={results.processingFeeAmount + results.gstOnProcessingFee} />
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <p className="text-sm text-blue-600 font-medium mb-2">Total Interest</p>
                      <p className="text-lg md:text-xl font-bold text-blue-800">
                        <AnimatedValue value={results.totalInterest} />
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-xl">
                      <p className="text-sm text-purple-600 font-medium mb-2">Total GST (Interest)</p>
                      <p className="text-lg md:text-xl font-bold text-purple-800">
                        <AnimatedValue value={results.totalGst} />
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-indigo-50 rounded-xl">
                      <p className="text-sm text-indigo-600 font-medium mb-2">Total Amount Paid</p>
                      <p className="text-lg md:text-xl font-bold text-indigo-800">
                        <AnimatedValue value={results.totalPaid} />
                      </p>
                    </div>
                  </div>
                </div>

                {/* Extra Cost Analysis */}
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
                    Cost Analysis
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Extra Amount Paid</h3>
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <p className="text-2xl md:text-3xl font-bold">
                        <AnimatedValue value={results.totalPaid - inputs.principal} />
                      </p>
                      <p className="text-red-100 text-sm mt-2">Above principal amount</p>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Effective Rate</h3>
                        <Percent className="w-6 h-6" />
                      </div>
                      <p className="text-2xl md:text-3xl font-bold">
                        {(((results.totalPaid - inputs.principal) / inputs.principal) * 100).toFixed(1)}%
                      </p>
                      <p className="text-purple-100 text-sm mt-2">Total cost vs principal</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Amortization Schedule */}
        {results && (
          <div className="mt-12">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-green-600" />
                Amortization Schedule
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-semibold text-gray-700">Month</th>
                      <th className="px-2 md:px-4 py-3 text-right text-xs md:text-sm font-semibold text-gray-700">Opening Balance</th>
                      <th className="px-2 md:px-4 py-3 text-right text-xs md:text-sm font-semibold text-gray-700">EMI (ex-GST)</th>
                      <th className="px-2 md:px-4 py-3 text-right text-xs md:text-sm font-semibold text-gray-700">Interest</th>
                      <th className="px-2 md:px-4 py-3 text-right text-xs md:text-sm font-semibold text-gray-700">Principal</th>
                      <th className="px-2 md:px-4 py-3 text-right text-xs md:text-sm font-semibold text-gray-700">GST on Interest</th>
                      <th className="px-2 md:px-4 py-3 text-right text-xs md:text-sm font-semibold text-gray-700">EMI + GST</th>
                      <th className="px-2 md:px-4 py-3 text-right text-xs md:text-sm font-semibold text-gray-700">Closing Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.amortizationSchedule.map((row, index) => (
                      <tr 
                        key={row.month} 
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${
                          index % 2 === 0 ? 'bg-gray-25' : ''
                        }`}
                      >
                        <td className="px-2 md:px-4 py-3 text-xs md:text-sm font-medium text-gray-900">{row.month}</td>
                        <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-gray-600 text-right">{formatCurrency(row.openingBalance)}</td>
                        <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-gray-600 text-right">{formatCurrency(row.emiExGst)}</td>
                        <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-red-600 text-right">{formatCurrency(row.interest)}</td>
                        <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-green-600 text-right">{formatCurrency(row.principal)}</td>
                        <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-orange-600 text-right">{formatCurrency(row.gstOnInterest)}</td>
                        <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-blue-600 text-right font-medium">{formatCurrency(row.emiWithGst)}</td>
                        <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-gray-600 text-right">{formatCurrency(row.closingBalance)}</td>
                      </tr>
                    ))}
                    
                    {/* Totals Row */}
                    <tr className="border-t-2 border-gray-300 bg-gray-100 font-semibold">
                      <td className="px-2 md:px-4 py-4 text-xs md:text-sm text-gray-900">TOTAL</td>
                      <td className="px-2 md:px-4 py-4 text-xs md:text-sm text-gray-600 text-right">-</td>
                      <td className="px-2 md:px-4 py-4 text-xs md:text-sm text-gray-600 text-right">
                        {formatCurrency(results.amortizationSchedule.reduce((sum, row) => sum + row.emiExGst, 0))}
                      </td>
                      <td className="px-2 md:px-4 py-4 text-xs md:text-sm text-red-700 text-right">
                        {formatCurrency(results.totalInterest)}
                      </td>
                      <td className="px-2 md:px-4 py-4 text-xs md:text-sm text-green-700 text-right">
                        {formatCurrency(inputs.principal)}
                      </td>
                      <td className="px-2 md:px-4 py-4 text-xs md:text-sm text-orange-700 text-right">
                        {formatCurrency(results.totalGst)}
                      </td>
                      <td className="px-2 md:px-4 py-4 text-xs md:text-sm text-blue-700 text-right font-bold">
                        {formatCurrency(results.amortizationSchedule.reduce((sum, row) => sum + row.emiWithGst, 0))}
                      </td>
                      <td className="px-2 md:px-4 py-4 text-xs md:text-sm text-gray-600 text-right">₹0</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
