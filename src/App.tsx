import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, FileText, DollarSign, Calendar, Percent, CreditCard, User } from 'lucide-react';

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

interface PersonalLoanResults {
  monthlyEmi: number;
  processingFeeAmount: number;
  gstOnProcessingFee: number;
  totalInterest: number;
  totalPaid: number;
  amortizationSchedule: AmortizationRow[];
}

function App() {
  const [activeTab, setActiveTab] = useState<'credit-card' | 'personal-loan'>('credit-card');
  
  // Credit Card Loan inputs
  const [creditCardInputs, setCreditCardInputs] = useState({
    principal: 1000000,
    annualRate: 12,
    tenureMonths: 24,
    gstRate: 18,
    processingFeeRate: 1
  });

  // Personal Loan inputs
  const [personalLoanInputs, setPersonalLoanInputs] = useState({
    principal: 1000000,
    annualRate: 12,
    tenureMonths: 24,
    processingFeeRate: 1
  });

  const [creditCardResults, setCreditCardResults] = useState<CalculationResults | null>(null);
  const [personalLoanResults, setPersonalLoanResults] = useState<PersonalLoanResults | null>(null);
  const [animateValues, setAnimateValues] = useState(false);

  const calculateCreditCardEMI = () => {
    const { principal, annualRate, tenureMonths, gstRate, processingFeeRate } = creditCardInputs;
    
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
    
    setCreditCardResults({
      monthlyEmi: emiExGst,
      processingFeeAmount,
      gstOnProcessingFee,
      totalInterest,
      totalGst,
      totalPaid,
      amortizationSchedule: schedule
    });
  };

  const calculatePersonalLoanEMI = () => {
    const { principal, annualRate, tenureMonths, processingFeeRate } = personalLoanInputs;
    
    // Monthly interest rate
    const monthlyRate = annualRate / 12 / 100;
    
    // EMI calculation
    const monthlyEmi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
                       (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    
    // Processing fee
    const processingFeeAmount = (principal * processingFeeRate) / 100;
    
    // GST on processing fee (18%)
    const gstOnProcessingFee = (processingFeeAmount * 18) / 100;
    
    // Generate amortization schedule
    const schedule: AmortizationRow[] = [];
    let balance = principal;
    let totalInterest = 0;
    
    for (let month = 1; month <= tenureMonths; month++) {
      const interest = balance * monthlyRate;
      const principalPayment = monthlyEmi - interest;
      
      schedule.push({
        month,
        openingBalance: balance,
        emiExGst: monthlyEmi,
        interest,
        principal: principalPayment,
        gstOnInterest: 0, // No GST on interest for personal loans
        emiWithGst: monthlyEmi, // Same as EMI since no GST on interest
        closingBalance: balance - principalPayment
      });
      
      balance -= principalPayment;
      totalInterest += interest;
    }
    
    // Total amount paid
    const totalPaid = (monthlyEmi * tenureMonths) + processingFeeAmount + gstOnProcessingFee;
    
    setPersonalLoanResults({
      monthlyEmi,
      processingFeeAmount,
      gstOnProcessingFee,
      totalInterest,
      totalPaid,
      amortizationSchedule: schedule
    });
  };

  useEffect(() => {
    if (activeTab === 'credit-card') {
      calculateCreditCardEMI();
    } else {
      calculatePersonalLoanEMI();
    }
    setAnimateValues(true);
    setTimeout(() => setAnimateValues(false), 800);
  }, [creditCardInputs, personalLoanInputs, activeTab]);

  const handleCreditCardInputChange = (field: string, value: number) => {
    setCreditCardInputs(prev => ({ ...prev, [field]: value }));
  };

  const handlePersonalLoanInputChange = (field: string, value: number) => {
    setPersonalLoanInputs(prev => ({ ...prev, [field]: value }));
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white">
              <Calculator className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              EMI Calculator
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Calculate your loan EMI with detailed breakdown</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-2 border border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('credit-card')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'credit-card'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                Credit Card Loan
              </button>
              <button
                onClick={() => setActiveTab('personal-loan')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'personal-loan'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <User className="w-5 h-5" />
                Personal Loan
              </button>
            </div>
          </div>
        </div>

        {/* Credit Card Loan Calculator */}
        {activeTab === 'credit-card' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Input Section */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Credit Card Loan Details
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Principal Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={creditCardInputs.principal}
                      onChange={(e) => handleCreditCardInputChange('principal', Number(e.target.value))}
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
                      value={creditCardInputs.annualRate}
                      onChange={(e) => handleCreditCardInputChange('annualRate', Number(e.target.value))}
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
                      value={creditCardInputs.tenureMonths}
                      onChange={(e) => handleCreditCardInputChange('tenureMonths', Number(e.target.value))}
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
                      value={creditCardInputs.gstRate}
                      onChange={(e) => handleCreditCardInputChange('gstRate', Number(e.target.value))}
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
                      value={creditCardInputs.processingFeeRate}
                      onChange={(e) => handleCreditCardInputChange('processingFeeRate', Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Default: 1%"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Section */}
            <div className="lg:col-span-2 space-y-6">
              {creditCardResults && (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Monthly EMI</h3>
                        <DollarSign className="w-6 h-6" />
                      </div>
                      <p className="text-2xl md:text-3xl font-bold">
                        <AnimatedValue value={creditCardResults.monthlyEmi} />
                      </p>
                      <p className="text-green-100 text-sm mt-2">EMI (ex-GST)</p>
                    </div>

                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Processing Fee</h3>
                        <Percent className="w-6 h-6" />
                      </div>
                      <p className="text-2xl md:text-3xl font-bold">
                        <AnimatedValue value={creditCardResults.processingFeeAmount} />
                      </p>
                      <p className="text-orange-100 text-sm mt-2">+ {formatCurrency(creditCardResults.gstOnProcessingFee)} GST</p>
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
                          <AnimatedValue value={creditCardResults.monthlyEmi} />
                        </p>
                      </div>
                      
                      <div className="text-center p-4 bg-orange-50 rounded-xl">
                        <p className="text-sm text-orange-600 font-medium mb-2">Processing Fee</p>
                        <p className="text-lg md:text-xl font-bold text-orange-800">
                          <AnimatedValue value={creditCardResults.processingFeeAmount + creditCardResults.gstOnProcessingFee} />
                        </p>
                      </div>
                      
                      <div className="text-center p-4 bg-blue-50 rounded-xl">
                        <p className="text-sm text-blue-600 font-medium mb-2">Total Interest</p>
                        <p className="text-lg md:text-xl font-bold text-blue-800">
                          <AnimatedValue value={creditCardResults.totalInterest} />
                        </p>
                      </div>
                      
                      <div className="text-center p-4 bg-purple-50 rounded-xl">
                        <p className="text-sm text-purple-600 font-medium mb-2">Total GST (Interest)</p>
                        <p className="text-lg md:text-xl font-bold text-purple-800">
                          <AnimatedValue value={creditCardResults.totalGst} />
                        </p>
                      </div>
                      
                      <div className="text-center p-4 bg-indigo-50 rounded-xl">
                        <p className="text-sm text-indigo-600 font-medium mb-2">Total Amount Paid</p>
                        <p className="text-lg md:text-xl font-bold text-indigo-800">
                          <AnimatedValue value={creditCardResults.totalPaid} />
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
                          <AnimatedValue value={creditCardResults.totalPaid - creditCardInputs.principal} />
                        </p>
                        <p className="text-red-100 text-sm mt-2">Above principal amount</p>
                      </div>

                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">Effective Rate</h3>
                          <Percent className="w-6 h-6" />
                        </div>
                        <p className="text-2xl md:text-3xl font-bold">
                          {(((creditCardResults.totalPaid - creditCardInputs.principal) / creditCardInputs.principal) * 100).toFixed(1)}%
                        </p>
                        <p className="text-purple-100 text-sm mt-2">Total cost vs principal</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Personal Loan Calculator */}
        {activeTab === 'personal-loan' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Input Section */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Personal Loan Details
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Principal Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={personalLoanInputs.principal}
                      onChange={(e) => handlePersonalLoanInputChange('principal', Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter principal amount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interest Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={personalLoanInputs.annualRate}
                      onChange={(e) => handlePersonalLoanInputChange('annualRate', Number(e.target.value))}
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
                      value={personalLoanInputs.tenureMonths}
                      onChange={(e) => handlePersonalLoanInputChange('tenureMonths', Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter tenure in months"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Processing Fee on Principal (%) + 18% GST
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={personalLoanInputs.processingFeeRate}
                      onChange={(e) => handlePersonalLoanInputChange('processingFeeRate', Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Default: 1%"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Section */}
            <div className="lg:col-span-2 space-y-6">
              {personalLoanResults && (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Monthly EMI</h3>
                        <DollarSign className="w-6 h-6" />
                      </div>
                      <p className="text-2xl md:text-3xl font-bold">
                        <AnimatedValue value={personalLoanResults.monthlyEmi} />
                      </p>
                      <p className="text-green-100 text-sm mt-2">EMI</p>
                    </div>

                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Processing Fee</h3>
                        <Percent className="w-6 h-6" />
                      </div>
                      <p className="text-2xl md:text-3xl font-bold">
                        <AnimatedValue value={personalLoanResults.processingFeeAmount} />
                      </p>
                      <p className="text-orange-100 text-sm mt-2">+ {formatCurrency(personalLoanResults.gstOnProcessingFee)} GST</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-indigo-600" />
                      Payment Summary
                    </h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-xl">
                        <p className="text-sm text-green-600 font-medium mb-2">Monthly EMI</p>
                        <p className="text-lg md:text-xl font-bold text-green-800">
                          <AnimatedValue value={personalLoanResults.monthlyEmi} />
                        </p>
                      </div>
                      
                      <div className="text-center p-4 bg-orange-50 rounded-xl">
                        <p className="text-sm text-orange-600 font-medium mb-2">Processing Fee total with GST</p>
                        <p className="text-lg md:text-xl font-bold text-orange-800">
                          <AnimatedValue value={personalLoanResults.processingFeeAmount + personalLoanResults.gstOnProcessingFee} />
                        </p>
                      </div>
                      
                      <div className="text-center p-4 bg-blue-50 rounded-xl">
                        <p className="text-sm text-blue-600 font-medium mb-2">Total Interest</p>
                        <p className="text-lg md:text-xl font-bold text-blue-800">
                          <AnimatedValue value={personalLoanResults.totalInterest} />
                        </p>
                      </div>
                      
                      <div className="text-center p-4 bg-indigo-50 rounded-xl">
                        <p className="text-sm text-indigo-600 font-medium mb-2">Total Amount Paid</p>
                        <p className="text-lg md:text-xl font-bold text-indigo-800">
                          <AnimatedValue value={personalLoanResults.totalPaid} />
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cost Analysis */}
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
                          <AnimatedValue value={personalLoanResults.totalPaid - personalLoanInputs.principal} />
                        </p>
                        <p className="text-red-100 text-sm mt-2">Above principal amount</p>
                      </div>

                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">Effective Rate</h3>
                          <Percent className="w-6 h-6" />
                        </div>
                        <p className="text-2xl md:text-3xl font-bold">
                          {(((personalLoanResults.totalPaid - personalLoanInputs.principal) / personalLoanInputs.principal) * 100).toFixed(1)}%
                        </p>
                        <p className="text-purple-100 text-sm mt-2">Total cost vs principal</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Amortization Schedule - For Personal Loan */}
        {activeTab === 'personal-loan' && personalLoanResults && (
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
                      <th className="px-2 md:px-4 py-3 text-right text-xs md:text-sm font-semibold text-gray-700">Monthly EMI</th>
                      <th className="px-2 md:px-4 py-3 text-right text-xs md:text-sm font-semibold text-gray-700">Interest</th>
                      <th className="px-2 md:px-4 py-3 text-right text-xs md:text-sm font-semibold text-gray-700">Principal</th>
                      <th className="px-2 md:px-4 py-3 text-right text-xs md:text-sm font-semibold text-gray-700">Closing Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personalLoanResults.amortizationSchedule.map((row, index) => (
                      <tr 
                        key={row.month} 
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${
                          index % 2 === 0 ? 'bg-gray-25' : ''
                        }`}
                      >
                        <td className="px-2 md:px-4 py-3 text-xs md:text-sm font-medium text-gray-900">{row.month}</td>
                        <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-gray-600 text-right">{formatCurrency(row.openingBalance)}</td>
                        <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-blue-600 text-right font-medium">{formatCurrency(row.emiExGst)}</td>
                        <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-red-600 text-right">{formatCurrency(row.interest)}</td>
                        <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-green-600 text-right">{formatCurrency(row.principal)}</td>
                        <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-gray-600 text-right">{formatCurrency(row.closingBalance)}</td>
                      </tr>
                    ))}
                    
                    {/* Totals Row */}
                    <tr className="border-t-2 border-gray-300 bg-gray-100 font-semibold">
                      <td className="px-2 md:px-4 py-4 text-xs md:text-sm text-gray-900">TOTAL</td>
                      <td className="px-2 md:px-4 py-4 text-xs md:text-sm text-gray-600 text-right">-</td>
                      <td className="px-2 md:px-4 py-4 text-xs md:text-sm text-blue-700 text-right font-bold">
                        {formatCurrency(personalLoanResults.amortizationSchedule.reduce((sum, row) => sum + row.emiExGst, 0))}
                      </td>
                      <td className="px-2 md:px-4 py-4 text-xs md:text-sm text-red-700 text-right">
                        {formatCurrency(personalLoanResults.totalInterest)}
                      </td>
                      <td className="px-2 md:px-4 py-4 text-xs md:text-sm text-green-700 text-right">
                        {formatCurrency(personalLoanInputs.principal)}
                      </td>
                      <td className="px-2 md:px-4 py-4 text-xs md:text-sm text-gray-600 text-right">₹0</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Amortization Schedule - Only for Credit Card */}
        {activeTab === 'credit-card' && creditCardResults && (
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
                    {creditCardResults.amortizationSchedule.map((row, index) => (
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
                        {formatCurrency(creditCardResults.amortizationSchedule.reduce((sum, row) => sum + row.emiExGst, 0))}
                      </td>
                      <td className="px-2 md:px-4 py-4 text-xs md:text-sm text-red-700 text-right">
                        {formatCurrency(creditCardResults.totalInterest)}
                      </td>
                      <td className="px-2 md:px-4 py-4 text-xs md:text-sm text-green-700 text-right">
                        {formatCurrency(creditCardInputs.principal)}
                      </td>
                      <td className="px-2 md:px-4 py-4 text-xs md:text-sm text-orange-700 text-right">
                        {formatCurrency(creditCardResults.totalGst)}
                      </td>
                      <td className="px-2 md:px-4 py-4 text-xs md:text-sm text-blue-700 text-right font-bold">
                        {formatCurrency(creditCardResults.amortizationSchedule.reduce((sum, row) => sum + row.emiWithGst, 0))}
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