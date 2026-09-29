import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  AreaChart, Area, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine, ReferenceArea
} from 'recharts';
import { 
  TrendingDown, DollarSign, Target, Award, AlertCircle, 
  CheckCircle, Activity, Zap, ArrowRight, Calendar,
  BarChart3, TrendingUp, Clock, Shield, Truck, FileText, Home
} from 'lucide-react';

// Main App Component with Navigation
const App = () => {
  const [currentView, setCurrentView] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white shadow-lg sticky top-0 z-20 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold text-gray-800">Mississauga Terminal</h1>
              <nav className="flex gap-4">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    currentView === 'dashboard' 
                      ? 'bg-purple-100 text-purple-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('executive')}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    currentView === 'executive' 
                      ? 'bg-purple-100 text-purple-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Executive Summary
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {currentView === 'dashboard' && <MississaugaTerminalDashboard />}
      {currentView === 'executive' && <ExecutiveSummary />}
    </div>
  );
};

// Enhanced Dashboard Component
const MississaugaTerminalDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Core financial metrics - enhanced with precision
  const financialMetrics = useMemo(() => ({
    f25Actual: 3868598,
    f26Target: 3482009,
    reduction: 386589,
    reductionPercent: 10.0,
    cwtReduction: 0.30,
    contractLabourSavings: 341153,
    contractLabourPercent: 88.2,
    f25CargoClaims: 134483,
    cargoClaimsTarget10: 13448,  // 10% reduction
    cargoClaimsTarget20: 26897   // additional 20% reduction
  }), []);

  // Monthly performance data with COS phases
  const performanceData = [
    { month: 'Jul-24', revenue: 3007111, costRatio: 58.82, contractLabour: 274677, phase: 'pre-cos', phaseLabel: 'Baseline' },
    { month: 'Aug-24', revenue: 2465966, costRatio: 58.29, contractLabour: 201283, phase: 'pre-cos', phaseLabel: 'Baseline' },
    { month: 'Sep-24', revenue: 2284660, costRatio: 62.84, contractLabour: 226503, phase: 'cos-prep', phaseLabel: 'Go-Live Delayed' },
    { month: 'Oct-24', revenue: 2337900, costRatio: 60.02, contractLabour: 161825, phase: 'cos-prep', phaseLabel: 'Go-Live Delayed' },
    { month: 'Nov-24', revenue: 2207045, costRatio: 76.12, contractLabour: 455763, phase: 'cos-deploy', phaseLabel: 'Official Go-Live' },
    { month: 'Dec-24', revenue: 1950229, costRatio: 74.98, contractLabour: 321978, phase: 'cos-deploy', phaseLabel: 'Peak Challenge' },
    { month: 'Jan-25', revenue: 1960049, costRatio: 73.83, contractLabour: 266885, phase: 'cos-deploy', phaseLabel: 'Stabilization' },
    { month: 'Feb-25', revenue: 1759701, costRatio: 60.79, contractLabour: 199896, phase: 'cos-deploy', phaseLabel: 'Breakthrough' },
    { month: 'Mar-25', revenue: 2345998, costRatio: 53.10, contractLabour: 217315, phase: 'post-cos', phaseLabel: 'Excellence' },
    { month: 'Apr-25', revenue: 2776961, costRatio: 54.55, contractLabour: 265701, phase: 'post-cos', phaseLabel: 'Optimized' },
    { month: 'May-25', revenue: 3116511, costRatio: 55.30, contractLabour: 344407, phase: 'post-cos', phaseLabel: 'Sustained' },
    { month: 'Jun-25', revenue: 3001933, costRatio: 55.78, contractLabour: 308331, phase: 'post-cos', phaseLabel: 'New Normal' }
  ];

  // Calculated metrics with memoization for performance
  const derivedMetrics = useMemo(() => {
    const preCOSAvg = 58.55;
    const postCOSAvg = 54.68;
    const improvement = ((preCOSAvg - postCOSAvg) / preCOSAvg * 100).toFixed(1);
    
    // Calculate average post-COS monthly revenue
    const postCOSMonths = performanceData.filter(m => m.phase === 'post-cos');
    const avgPostCOSRevenue = postCOSMonths.reduce((sum, m) => sum + m.revenue, 0) / postCOSMonths.length;
    
    // Monthly operational savings from efficiency gain
    const monthlySavings = (preCOSAvg - postCOSAvg) / 100 * avgPostCOSRevenue;
    
    // Implementation cost recovery period (not traditional ROI)
    const recoveryMonths = Math.ceil(financialMetrics.contractLabourSavings / monthlySavings);
    
    return {
      preCOSAvg,
      postCOSAvg,
      improvement,
      monthlySavings: Math.round(monthlySavings),
      recoveryMonths,
      implementationCost: financialMetrics.contractLabourSavings
    };
  }, [financialMetrics, performanceData]);

  // Savings breakdown with visual hierarchy - corrected amounts
  const savingsBreakdown = [
    { category: 'Dock Contract Workers', amount: 178829, percentage: 41.9, color: '#8b5cf6', icon: Activity },
    { category: 'Admin Contract Workers', amount: 162324, percentage: 38.0, color: '#06b6d4', icon: BarChart3 },
    { category: 'Shunting Optimization', amount: 31800, percentage: 7.4, color: '#f59e0b', icon: Truck },
    { category: 'Forklift Rentals', amount: 25000, percentage: 5.9, color: '#10b981', icon: Zap },
    { category: 'Garbage Disposal', amount: 15600, percentage: 3.7, color: '#ef4444', icon: AlertCircle },
    { category: 'Cargo Claims (10% reduction)', amount: 13448, percentage: 3.1, color: '#ec4899', icon: Shield }
  ];
  
  const totalIdentifiedSavings = savingsBreakdown.reduce((sum, item) => sum + item.amount, 0);

  // Phase performance metrics
  const phaseMetrics = {
    preCOS: { avgCostRatio: 58.55, months: 'Jul-Aug 2024', color: '#6b7280', label: 'Baseline Performance' },
    training: { avgCostRatio: 61.43, months: 'Sep-Oct 2024', color: '#f59e0b', label: 'Training & Delays' },
    deployment: { avgCostRatio: 71.43, months: 'Nov 2024-Feb 2025', color: '#ef4444', label: 'Live Implementation' },
    postCOS: { avgCostRatio: 54.68, months: 'Mar-Jun 2025', color: '#10b981', label: 'New Excellence' }
  };

  // Implementation timeline
  const implementationTimeline = [
    { date: 'Sep 2024', event: 'COS Training Begins - Staff prepared for new system while go-live date kept getting postponed', impact: 'neutral' },
    { date: 'Oct 2024', event: 'Continued Training - Teams maintained readiness despite ongoing delays and uncertainty', impact: 'neutral' },
    { date: 'Nov 2024', event: 'Official Go-Live - System finally launched, costs spiked to 76.12% as expected', impact: 'negative' },
    { date: 'Feb 2025', event: 'Breakthrough Achieved - Team mastery improved, costs dropped significantly', impact: 'positive' },
    { date: 'Mar 2025', event: 'Excellence Realized - Achieved 53.10% cost ratio, best in terminal history', impact: 'positive' },
    { date: 'Jul 2025', event: 'F26 Launch - All initiatives implementing ($427K), planning 10% above target', impact: 'future' },
    { date: 'Q2 F26', event: 'Optional Initiative Assessment - Security optimization ($91K) available if needed', impact: 'future' }
  ];

  // Custom tooltip for financial data - enhanced
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl">
          <p className="font-semibold text-gray-800">{label}</p>
          {data.phaseLabel && <p className="text-sm text-gray-600 mb-2">{data.phaseLabel}</p>}
          {payload.map((entry, index) => (
            <p key={index} className="text-sm">
              <span style={{ color: entry.color }}>{entry.name}: </span>
              <span className="font-medium">
                {entry.name.includes('$') || entry.name.includes('Labour') || entry.name.includes('Revenue')
                  ? `$${entry.value.toLocaleString()}` 
                  : entry.name.includes('%') || entry.name.includes('Ratio')
                  ? `${entry.value}%`
                  : entry.value.toLocaleString()}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Tab content renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            {/* Executive Context Section */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl shadow-xl p-8 mb-8 text-white">
              <div className="max-w-4xl">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <Activity className="w-8 h-8" />
                  Executive Summary
                </h2>
                <p className="text-lg leading-relaxed opacity-95">
                  Following a successful Core Operating System (COS) deployment that temporarily increased costs during implementation, 
                  the Mississauga Terminal has achieved <span className="font-bold text-green-400">best-in-class operational efficiency</span>. 
                  We have identified <span className="font-bold text-yellow-400">${totalIdentifiedSavings.toLocaleString()}</span> in 
                  sustainable cost reduction initiatives for Fiscal 2026, <span className="font-bold text-green-400">${(totalIdentifiedSavings - financialMetrics.reduction).toLocaleString()} above our $386,589 target (110% of target)</span>.
                </p>
                <div className="mt-4 flex items-center gap-4 text-sm opacity-80">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>F25: July 2024 - June 2025</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>F26: July 2025 - June 2026</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Metrics Grid - Enhanced with better data */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              {/* F26 Target */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-green-600 p-4">
                  <div className="flex items-center justify-between">
                    <Target className="w-8 h-8 text-white opacity-90" />
                    <span className="text-sm font-medium text-white opacity-90">PLANNED</span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-600 mb-1">F26 Identified Savings</p>
                  <p className="text-3xl font-bold text-gray-900">${totalIdentifiedSavings.toLocaleString()}</p>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">Reduction target</p>
                    <p className="text-sm font-semibold text-gray-700">$386,589</p>
                    <p className="text-xs text-green-600 font-medium mt-1">+${(totalIdentifiedSavings - financialMetrics.reduction).toLocaleString()} (110% of target)</p>
                  </div>
                </div>
              </div>

              {/* Contract Labour Savings */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-purple-600 p-4">
                  <div className="flex items-center justify-between">
                    <Activity className="w-8 h-8 text-white opacity-90" />
                    <span className="text-sm font-medium text-white opacity-90">79.9% OF PLAN</span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-600 mb-1">Contract Labour Optimization</p>
                  <p className="text-3xl font-bold text-gray-900">${financialMetrics.contractLabourSavings.toLocaleString()}</p>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">Implementation approach:</p>
                    <p className="text-sm font-semibold text-gray-700">Maintain post-COS efficiency</p>
                  </div>
                </div>
              </div>

              {/* Efficiency Achievement */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-green-600 p-4">
                  <div className="flex items-center justify-between">
                    <TrendingUp className="w-8 h-8 text-white opacity-90" />
                    <span className="text-sm font-medium text-white opacity-90">CURRENT</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600 mb-1">Operational Efficiency Gain</p>
                    <p className="text-4xl font-bold text-green-600">{derivedMetrics.improvement}%</p>
                  </div>
                  <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 text-center mb-3 font-medium">Cost-to-Revenue Ratio Improvement</p>
                    <div className="flex items-center justify-center gap-3">
                      <div className="text-center bg-white rounded-lg px-4 py-2 shadow-sm">
                        <p className="text-xs text-gray-500 font-medium">PRE</p>
                        <p className="text-xl font-bold text-gray-700">{derivedMetrics.preCOSAvg}%</p>
                      </div>
                      <TrendingDown className="w-6 h-6 text-green-500" />
                      <div className="text-center bg-white rounded-lg px-4 py-2 shadow-sm">
                        <p className="text-xs text-gray-500 font-medium">POST</p>
                        <p className="text-xl font-bold text-green-600">{derivedMetrics.postCOSAvg}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Implementation Cost Recovery */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-blue-600 p-4">
                  <div className="flex items-center justify-between">
                    <Clock className="w-8 h-8 text-white opacity-90" />
                    <span className="text-sm font-medium text-white opacity-90">RECOVERY</span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-600 mb-1">Implementation Cost Recovery</p>
                  <p className="text-3xl font-bold text-gray-900">{derivedMetrics.recoveryMonths} months</p>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">Monthly operational savings</p>
                    <p className="text-sm font-semibold text-gray-700">${derivedMetrics.monthlySavings.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-2">From 6.6% efficiency gain</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contract Labour Savings Summary */}
            <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-6 mb-8">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Implementation Cost: $341,153</p>
                  <p className="text-sm text-gray-700">
                    The excess contract labour costs during COS deployment (Sep 2024 - Feb 2025) represent our one-time implementation investment. 
                    With our terminal now operating 6.6% more efficiently, we're realizing ~$109K in monthly operational savings - 
                    meaning the implementation cost is recovered in just 4 months through improved performance.
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Journey - FIXED CHART */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">COS Implementation Journey & Cost Performance</h2>
                <p className="text-sm text-gray-600 mt-1">Monthly cost-to-revenue ratio showing the investment phase and payoff</p>
                <p className="text-xs text-gray-500 mt-2">
                  Note: Revenue fluctuates with freight volume (CWT). As volume increases, both revenue and costs typically rise together, 
                  which is why cost-to-revenue ratio is our key efficiency metric.
                </p>
              </div>
              
              {/* Go-Live Context Box */}
              <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-amber-800 mb-1">Implementation Context</p>
                    <p className="text-amber-700">Sep-Oct 2024: Multiple go-live postponements created a costly cycle of ramping up contract staff for training, then releasing them when dates were pushed. This pattern repeated several times, significantly increasing our contract labour burn rate before the system finally launched in November 2024.</p>
                  </div>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={440}>
                <ComposedChart 
                  data={performanceData} 
                  margin={{ top: 50, right: 150, bottom: 60, left: 80 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    </linearGradient>
                    <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4">
                      <path d="M 0,4 l 4,-4 M -1,1 l 2,-2 M 3,5 l 2,-2" stroke="#f59e0b" strokeWidth="0.5" opacity="0.3"/>
                    </pattern>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    angle={-45} 
                    textAnchor="end" 
                    height={60}
                    interval={0}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis 
                    yAxisId="left" 
                    domain={[45, 80]} 
                    label={{ 
                      value: 'Cost Ratio %', 
                      angle: -90, 
                      position: 'insideLeft',
                      offset: 20,
                      style: { fontSize: 14, textAnchor: 'middle' }
                    }}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    label={{ 
                      value: 'Revenue ($)', 
                      angle: 90, 
                      position: 'insideRight',
                      offset: 20,
                      style: { fontSize: 14, textAnchor: 'middle' }
                    }}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => `${(value/1000000).toFixed(1)}M`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    iconType="rect"
                    wrapperStyle={{ paddingTop: '10px' }}
                  />
                  {/* Target zone */}
                  <ReferenceArea yAxisId="left" y1={50} y2={60} fill="#10b981" fillOpacity={0.1} />
                  {/* Training period with uncertainty */}
                  <ReferenceArea yAxisId="left" x1="Sep-24" x2="Oct-24" fill="url(#diagonalHatch)" stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 3" />
                  {/* Actual COS deployment period */}
                  <ReferenceArea yAxisId="left" x1="Nov-24" x2="Feb-25" fill="#ef4444" fillOpacity={0.1} stroke="#ef4444" strokeWidth={2} />
                  <ReferenceLine 
                    yAxisId="left" 
                    y={55} 
                    stroke="#10b981" 
                    strokeDasharray="5 5" 
                    strokeWidth={2} 
                    label={{ 
                      value: "Target Zone", 
                      position: "insideTopRight",
                      offset: 5,
                      style: { fontSize: 12, fill: '#10b981' }
                    }} 
                  />
                  <Area 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="revenue" 
                    fill="url(#colorRevenue)" 
                    stroke="#8b5cf6"
                    name="Revenue ($)"
                  />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="costRatio" 
                    stroke="#374151"
                    strokeWidth={3}
                    name="Cost Ratio %"
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      let fill = '#6b7280'; // gray for pre-COS
                      let r = 5;
                      let strokeWidth = 1;
                      
                      if (payload.phase === 'cos-prep') {
                        fill = '#f59e0b'; // orange for preparation/training
                        r = 5;
                      } else if (payload.phase === 'cos-deploy') {
                        fill = '#ef4444'; // red for deployment
                        r = 6;
                      } else if (payload.phase === 'post-cos') {
                        fill = '#10b981'; // green for post-COS
                        r = 5;
                      }
                      
                      // Special markers
                      if (payload.month === 'Nov-24') {
                        // Official go-live marker
                        return (
                          <g>
                            <circle cx={cx} cy={cy} r={12} fill={fill} fillOpacity={0.2} />
                            <circle cx={cx} cy={cy} r={8} fill={fill} stroke="#fff" strokeWidth={2} />
                            <text x={cx+20} y={cy+30} textAnchor="middle" fontSize="11" fill={fill} fontWeight="bold">GO LIVE</text>
                          </g>
                        );
                      }
                      if (payload.month === 'Sep-24' || payload.month === 'Oct-24') {
                        // Training period with uncertainty
                        strokeWidth = 2;
                      }
                      return <circle cx={cx} cy={cy} r={r} fill={fill} stroke="#fff" strokeWidth={strokeWidth} />;
                    }}
                    activeDot={{ r: 8 }}
                  />
                  <Bar 
                    yAxisId="right" 
                    dataKey="contractLabour" 
                    fill="#06b6d4" 
                    opacity={0.6} 
                    name="Contract Labour ($)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
              
              {/* Phase indicators */}
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                    <span className="text-sm font-medium">Pre-COS Baseline</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-lg border border-orange-300">
                    <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                    <span className="text-sm font-medium">Training (Go-Live Delayed)</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-red-50 rounded-lg border border-red-300">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium">COS Live Operations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Post-COS Excellence</span>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-600 italic">
                  Sep-Oct: Training costs incurred while go-live dates were pushed | Nov: Official launch triggered peak disruption | Mar onwards: Excellence achieved
                </p>
              </div>
            </div>

            {/* Savings Composition - Enhanced with better visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-800">F26 Savings Plan: ${totalIdentifiedSavings.toLocaleString()}</h2>
                  <p className="text-sm text-gray-600 mt-1">${(totalIdentifiedSavings - financialMetrics.reduction).toLocaleString()} above our $386,589 target</p>
                  <div className="mt-2 p-2 bg-green-50 rounded-lg inline-block">
                    <p className="text-xs font-medium text-green-800">110% of target identified</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={340}>
                  <PieChart>
                    <Pie
                      data={savingsBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="amount"
                      label={({ percentage }) => `${percentage}%`}
                    >
                      {savingsBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-6 space-y-3">
                  {savingsBreakdown.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${item.color}20` }}>
                            <Icon className="w-5 h-5" style={{ color: item.color }} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{item.category}</p>
                            <p className="text-xs text-gray-500">
                              {item.category.includes('Contract') ? 'Maintain current efficiency' : 
                               item.category === 'Cargo Claims (10% reduction)' ? `Reduce from $134K to $121K` :
                               item.category === 'Shunting Optimization' ? 'Schedule optimization' :
                               item.category === 'Garbage Disposal' ? 'Adjust schedule frequency' :
                               'Operational optimization'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">${item.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{item.percentage}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-800">The Transformation Journey</h2>
                  <p className="text-sm text-gray-600 mt-1">From implementation challenge to operational excellence</p>
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-800">
                      <strong>Cost-to-Revenue Ratio:</strong> The percentage of revenue consumed by operating costs. 
                      Maintaining our current efficiency levels will enable us to reach our F26 reduction goals.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {Object.entries(phaseMetrics).map(([phase, metrics], index) => {
                    const phaseDescriptions = {
                      preCOS: 'Standard operations before system change',
                      training: 'Staff prepared while go-live was delayed',
                      deployment: 'System went live with expected disruption',
                      postCOS: 'Achieved best efficiency in terminal history'
                    };
                    
                    return (
                      <div key={phase} className="relative">
                        {index < Object.keys(phaseMetrics).length - 1 && (
                          <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-300"></div>
                        )}
                        <div className="flex items-start gap-4">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold relative z-10"
                            style={{ backgroundColor: metrics.color }}
                          >
                            {index + 1}
                          </div>
                          <div className="flex-1 pb-6">
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-gray-800">{metrics.label || phase}</h3>
                                <span className="text-xs text-gray-500">{metrics.months}</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{phaseDescriptions[phase]}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Average Cost Ratio:</span>
                                <span className="text-lg font-bold" style={{ color: metrics.color }}>
                                  {metrics.avgCostRatio}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Line Summary */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-xl p-8 text-white">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-2xl font-bold mb-4">The Bottom Line</h2>
                <p className="text-lg leading-relaxed">
                  The COS implementation cost us $341,153 in excess contract labour due to multiple go-live delays and the necessary dual operations period. 
                  However, we've emerged with <span className="font-bold">permanently improved efficiency</span> - now operating 6.6% better than pre-COS baseline. 
                  This translates to ~$109K in monthly operational savings. We're identifying <span className="font-bold text-yellow-300">${totalIdentifiedSavings.toLocaleString()}</span> in 
                  F26 initiatives, <span className="font-bold">10% above our target</span>, with an optional $91K security initiative providing additional cushion.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-semibold">All initiatives launching July 2025</span>
                </div>
              </div>
            </div>
          </>
        );

      case 'timeline':
        return (
          <div className="space-y-8">
            {/* Timeline Overview */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl shadow-xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">Implementation Journey</h2>
              <p className="text-lg opacity-95">
                From go-live delays to operational excellence: How we transformed a challenging 
                implementation into best-in-class performance.
              </p>
            </div>

            {/* PERFORMANCE TIMELINE - FIXED CHART */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Monthly Performance Metrics</h2>
              <p className="text-sm text-gray-600 mb-4">Cost ratio and contract labour trends throughout the journey</p>
              
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart 
                  data={performanceData}
                  margin={{ top: 50, right: 150, bottom: 60, left: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis 
                    yAxisId="left" 
                    domain={[45, 80]} 
                    label={{ 
                      value: 'Cost Ratio %', 
                      angle: -90, 
                      position: 'insideLeft',
                      offset: 20,
                      style: { fontSize: 14, textAnchor: 'middle' }
                    }}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    label={{ 
                      value: 'Contract Labour ($)', 
                      angle: 90, 
                      position: 'insideRight',
                      offset: 20,
                      style: { fontSize: 14, textAnchor: 'middle' }
                    }}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => `${(value/1000).toFixed(0)}K`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top"
                    height={36}
                    iconType="rect"
                  />
                  <ReferenceLine 
                    yAxisId="left" 
                    y={55} 
                    stroke="#10b981" 
                    strokeDasharray="5 5" 
                    strokeWidth={2} 
                    label={{ 
                      value: "Target Zone",
                      position: "insideTopRight",
                      offset: 5,
                      style: { fontSize: 12, fill: '#10b981' }
                    }}
                  />
                  <Bar 
                    yAxisId="right" 
                    dataKey="contractLabour" 
                    fill="#8b5cf6" 
                    opacity={0.7} 
                    name="Contract Labour ($)"
                  />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="costRatio" 
                    stroke="#ef4444" 
                    strokeWidth={3} 
                    name="Cost Ratio %"
                    dot={{ r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
              
              {/* Monthly summary cards */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase">Pre-COS Average</p>
                  <p className="text-lg font-bold text-gray-900">{derivedMetrics.preCOSAvg}%</p>
                  <p className="text-sm text-gray-600">Cost Ratio</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase">Peak Impact</p>
                  <p className="text-lg font-bold text-red-600">76.12%</p>
                  <p className="text-sm text-gray-600">Nov 2024</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase">Current State</p>
                  <p className="text-lg font-bold text-green-600">{derivedMetrics.postCOSAvg}%</p>
                  <p className="text-sm text-gray-600">Post-COS</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase">Improvement</p>
                  <p className="text-lg font-bold text-blue-600">{derivedMetrics.improvement}%</p>
                  <p className="text-sm text-gray-600">Better</p>
                </div>
              </div>
            </div>

            {/* Implementation Timeline */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-8 text-gray-800">Key Milestones & Events</h2>
              <div className="relative">
                {implementationTimeline.map((item, index) => (
                  <div key={index} className="flex items-start mb-8 last:mb-0">
                    {/* Timeline line */}
                    {index < implementationTimeline.length - 1 && (
                      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-300"></div>
                    )}
                    
                    {/* Icon */}
                    <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                      item.impact === 'negative' ? 'bg-red-100 ring-4 ring-red-50' : 
                      item.impact === 'positive' ? 'bg-green-100 ring-4 ring-green-50' : 
                      item.impact === 'future' ? 'bg-blue-100 ring-4 ring-blue-50' : 
                      'bg-gray-100 ring-4 ring-gray-50'
                    }`}>
                      {item.impact === 'negative' ? <AlertCircle className="w-6 h-6 text-red-600" /> :
                       item.impact === 'positive' ? <CheckCircle className="w-6 h-6 text-green-600" /> :
                       item.impact === 'future' ? <Zap className="w-6 h-6 text-blue-600" /> :
                       <Clock className="w-6 h-6 text-gray-600" />}
                    </div>
                    
                    {/* Content */}
                    <div className="ml-6 flex-1">
                      <div className={`p-6 rounded-xl ${
                        item.impact === 'negative' ? 'bg-red-50 border border-red-200' : 
                        item.impact === 'positive' ? 'bg-green-50 border border-green-200' : 
                        item.impact === 'future' ? 'bg-blue-50 border border-blue-200' : 
                        'bg-gray-50 border border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-bold text-gray-800 text-lg">{item.date}</p>
                          {item.impact === 'future' && (
                            <span className="text-xs font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full">F26</span>
                          )}
                        </div>
                        <p className="text-gray-700">{item.event}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Curve Visualization - FIXED CHART */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Team Efficiency Learning Curve</h2>
                <p className="text-sm text-gray-600 mt-1">How our team adapted and excelled through the COS transition</p>
              </div>
              <ResponsiveContainer width="100%" height={360}>
                <AreaChart 
                  data={[
                    { period: 'Pre-COS', efficiency: 85, fill: '#6b7280' },
                    { period: 'Sep-24', efficiency: 75, fill: '#f59e0b' },
                    { period: 'Oct-24', efficiency: 70, fill: '#f59e0b' },
                    { period: 'Nov-24', efficiency: 45, fill: '#ef4444' },
                    { period: 'Dec-24', efficiency: 50, fill: '#ef4444' },
                    { period: 'Jan-25', efficiency: 55, fill: '#f59e0b' },
                    { period: 'Feb-25', efficiency: 70, fill: '#f59e0b' },
                    { period: 'Mar-25', efficiency: 90, fill: '#10b981' },
                    { period: 'Apr-25', efficiency: 93, fill: '#10b981' },
                    { period: 'May-25', efficiency: 94, fill: '#10b981' },
                    { period: 'Jun-25', efficiency: 95, fill: '#10b981' }
                  ]}
                  margin={{ top: 20, right: 40, bottom: 60, left: 60 }}
                >
                  <defs>
                    <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="period" 
                    angle={-45} 
                    textAnchor="end" 
                    height={60}
                    interval={0}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fontSize: 11 }}
                    label={{
                      value: 'Efficiency %',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 10,
                      style: { fontSize: 14, textAnchor: 'middle' }
                    }}
                  />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Area 
                    type="monotone" 
                    dataKey="efficiency" 
                    stroke="#10b981" 
                    fill="url(#colorEfficiency)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
              
              {/* Key Insights */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Training Period</p>
                  <p className="text-xs text-gray-600">Efficiency declined from 85% to 70% as teams juggled training with go-live delays</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Go-Live Impact</p>
                  <p className="text-xs text-gray-600">November saw 45% efficiency - expected disruption from dual operations</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Excellence Achieved</p>
                  <p className="text-xs text-gray-600">Steady improvement from 90% (Mar) to 95% (Jun) - exceeding pre-COS baseline</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'initiatives':
        return (
          <div className="space-y-8">
            {/* Initiative Overview */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl shadow-xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">F26 Cost Reduction Strategy</h2>
              <p className="text-lg opacity-95">
                Six core initiatives launching July 2025, identifying <span className="font-bold text-yellow-300">${totalIdentifiedSavings.toLocaleString()}</span> in savings - 
                <span className="font-bold text-green-300"> 10% above our target</span>. An optional $91K security initiative provides additional flexibility.
              </p>
            </div>

            {/* F26 Initiative Details */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-2 text-gray-800">Cost Reduction Initiatives</h2>
              <p className="text-gray-600 mb-6">Core initiatives launching July 2025 - already exceeding target by ${(totalIdentifiedSavings - financialMetrics.reduction).toLocaleString()}</p>
              
              <div className="space-y-4">
                {[
                  { 
                    name: 'Dock Contract Labour Optimization', 
                    amount: 178829, 
                    status: 'maintaining', 
                    description: 'Maintain post-COS efficiency levels',
                    detail: 'Continue using optimized staffing model proven successful Mar-Jun 2025'
                  },
                  { 
                    name: 'Admin Contract Labour Optimization', 
                    amount: 162324, 
                    status: 'maintaining', 
                    description: 'Sustain current performance benchmarks',
                    detail: 'Lock in administrative efficiency gains achieved through COS tools'
                  },
                  { 
                    name: 'Shunting Optimization', 
                    amount: 31800, 
                    status: 'new', 
                    description: 'Schedule optimization and reduction of hours',
                    detail: 'Streamline shunting schedules and reduce operational hours based on actual demand patterns'
                  },
                  { 
                    name: 'Cargo Claims Reduction', 
                    amount: 13448, 
                    status: 'new', 
                    description: '10% reduction from F25 baseline',
                    detail: `Reduce claims from $${financialMetrics.f25CargoClaims.toLocaleString()} to $${(financialMetrics.f25CargoClaims - 13448).toLocaleString()} through enhanced handling procedures`
                  },
                  { 
                    name: 'Forklift Rental Reduction', 
                    amount: 25000, 
                    status: 'new', 
                    description: 'Return 2 rental units',
                    detail: 'Optimize equipment utilization to eliminate need for 2 rental forklifts'
                  },
                  { 
                    name: 'Garbage Disposal Optimization', 
                    amount: 15600, 
                    status: 'new', 
                    description: 'Adjust schedule frequency',
                    detail: 'Optimize waste management schedule based on actual volume needs'
                  }
                ].map((initiative, index) => (
                  <div key={index} className={`p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
                    initiative.status === 'maintaining' 
                      ? 'border-green-200 bg-gradient-to-r from-green-50 to-green-100' 
                      : 'border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-4">
                        <h3 className="font-bold text-gray-800 text-lg mb-1">{initiative.name}</h3>
                        <p className="text-gray-700 font-medium mb-2">{initiative.description}</p>
                        <p className="text-sm text-gray-600">{initiative.detail}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-3xl font-bold text-gray-800">${initiative.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-600 mt-1">{(initiative.amount / totalIdentifiedSavings * 100).toFixed(1)}% of total</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-3 ${
                          initiative.status === 'maintaining' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {initiative.status === 'maintaining' ? '✓ Maintaining F25 Gains' : '→ New Initiative'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold opacity-90">Total F26 Core Initiatives</p>
                    <p className="text-sm opacity-70 mt-1">Exceeding reduction target by 10%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold">${totalIdentifiedSavings.toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <p className="text-sm opacity-90">Target: $386,589</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Optional Security Initiative */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Optional F26 Initiative</h2>
                <p className="text-sm text-gray-600 mt-1">Additional opportunity providing further cushion above target</p>
              </div>
              
              <div className="p-6 border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <h3 className="font-bold text-gray-800 text-xl mb-2">Security Guard Hours Reduction</h3>
                    <p className="text-gray-700 font-medium mb-2">Comprehensive security coverage optimization</p>
                    <p className="text-sm text-gray-600 mb-4">Full review and optimization of security coverage patterns, focusing on overnight and weekend shifts while maintaining safety standards</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="bg-amber-200 text-amber-800 px-3 py-1 rounded-full font-medium">Optional</span>
                      <span className="text-gray-600">• Implementation flexibility based on Q1 assessment</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-4xl font-bold text-amber-700">$91,000</p>
                    <p className="text-sm text-gray-600 mt-1">Annual savings</p>
                    <div className="mt-4 p-3 bg-white rounded-lg">
                      <p className="text-xs text-gray-500">With this initiative:</p>
                      <p className="text-lg font-bold text-gray-800">$518,001</p>
                      <p className="text-xs text-green-600 font-medium">134% of target</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Future Opportunities */}
            <div className="bg-gray-50 rounded-xl p-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Future Enhancement Opportunities</h3>
              <p className="text-sm text-gray-600 mb-6">Additional savings potential for F26 Q3-Q4 consideration</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">Extended Cargo Claims Program</h4>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">+20% reduction</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600 mb-1">$26,897</p>
                  <p className="text-xs text-gray-600">Reduce claims from $121K to $94K through advanced handling protocols</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">Operating Supplies Control</h4>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Monthly cap</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 mb-1">$5,418</p>
                  <p className="text-xs text-gray-600">Implement $1,500/month spending limit with approval process</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 tracking-tight">Mississauga Terminal</h1>
              <p className="text-xl opacity-90">F26 Cost Transformation Dashboard</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-70 uppercase tracking-wider">Target Planning</p>
              <p className="text-3xl font-bold text-green-400">110%</p>
              <p className="text-sm opacity-70">$427,001 identified</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-lg sticky top-0 z-10 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-0">
            {[
              { id: 'overview', label: 'Executive Overview', icon: BarChart3 },
              { id: 'timeline', label: 'Implementation Timeline', icon: Calendar },
              { id: 'initiatives', label: 'F26 Initiatives', icon: Target }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-8 py-5 font-medium transition-all border-b-3 ${
                  activeTab === tab.id
                    ? 'text-purple-600 border-purple-600 bg-purple-50/50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-transparent'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {renderTabContent()}
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-3 text-lg">F25 Achievement</h3>
              <p className="text-sm opacity-80 leading-relaxed">
                Successfully completed COS implementation, now operating with {derivedMetrics.improvement}% better efficiency than pre-COS baseline.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-lg">Implementation Impact</h3>
              <p className="text-sm opacity-80 leading-relaxed">
                COS deployment cost $341,153 in implementation expenses. 
                Now generating ~$109K monthly through 6.6% efficiency improvement.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-lg">Next Steps</h3>
              <p className="text-sm opacity-80 leading-relaxed">
                F26 initiatives ($427K) launching July 2025. 
                Optional security initiative ($91K) available. Monthly monitoring will track performance.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p className="text-sm opacity-60">Fiscal 2026 Cost Transformation Program</p>
            <p className="text-xs opacity-50 mt-1">Mississauga Terminal Operations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Executive Summary Component
const ExecutiveSummary = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h1 className="text-3xl font-bold mb-6">MISSISSAUGA TERMINAL</h1>
        <h2 className="text-xl font-semibold mb-4 text-gray-700">F26 COST TRANSFORMATION EXECUTIVE SUMMARY</h2>
        
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p><strong>Date:</strong> July 2025</p>
          <p><strong>Prepared for:</strong> Executive Leadership Team</p>
          <p><strong>Subject:</strong> Achievement of $427,001 Cost Reduction (110% of Target)</p>
        </div>

        <div className="prose max-w-none">
          <h3 className="text-2xl font-bold mt-8 mb-4">EXECUTIVE SUMMARY</h3>
          <p className="mb-4">
            The Mississauga Terminal has successfully identified $427,001 in annual cost reductions for Fiscal 2026, 
            exceeding our mandated $386,589 target by 10%. This achievement leverages the operational excellence gained 
            from our Core Operating System (COS) deployment, transforming temporary implementation costs into permanent efficiency gains.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">F25 Actual Costs</p>
              <p className="text-2xl font-bold">$3,868,598</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">F26 Target</p>
              <p className="text-2xl font-bold">$3,482,009</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Required Reduction</p>
              <p className="text-2xl font-bold">$386,589</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Identified Savings</p>
              <p className="text-2xl font-bold text-green-600">$427,001</p>
              <p className="text-xs text-green-600">110% of target</p>
            </div>
          </div>

          <h3 className="text-2xl font-bold mt-8 mb-4">THE TRANSFORMATION STORY</h3>
          
          <h4 className="text-xl font-semibold mt-6 mb-3">1. The Challenge: COS Implementation</h4>
          <p className="mb-4">
            From September 2024 to February 2025, the Mississauga Terminal underwent a Core Operating System implementation 
            marked by significant challenges:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Multiple Go-Live Delays:</strong> Repeated postponements created a costly cycle of hiring and releasing contract staff</li>
            <li><strong>Peak Disruption:</strong> November 2024 saw costs spike to 76.12% (vs. 55% target) during go-live</li>
            <li><strong>Total Implementation Cost:</strong> $341,153 in excess contract labour over 6 months</li>
          </ul>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
            <p className="font-semibold">Key Insight:</p>
            <p>These costs were not failures but necessary investments in transformational change. 
            The repeated delays, while expensive, ensured thorough preparation for successful adoption.</p>
          </div>

          <h4 className="text-xl font-semibold mt-6 mb-3">2. The Breakthrough: Operational Excellence</h4>
          <p className="mb-4">Post-implementation (March-June 2025), the terminal achieved:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Efficiency Gain:</strong> 6.6% improvement (58.55% → 54.68% cost ratio)</li>
            <li><strong>Monthly Savings:</strong> ~$109,000 from improved operations</li>
            <li><strong>Recovery Period:</strong> Implementation costs recovered in just 4 months</li>
            <li><strong>Sustained Performance:</strong> 4 consecutive months at target efficiency</li>
          </ul>

          <h4 className="text-xl font-semibold mt-6 mb-3">3. The F26 Strategy: Maintaining Excellence</h4>
          
          <table className="w-full border-collapse mb-8">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Initiative</th>
                <th className="border p-2 text-right">Annual Savings</th>
                <th className="border p-2 text-right">% of Total</th>
                <th className="border p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-50">
                <td className="border p-2 font-semibold" colSpan={4}>CONTRACT LABOUR EFFICIENCY (79.9%)</td>
              </tr>
              <tr>
                <td className="border p-2">Dock Contract Labour</td>
                <td className="border p-2 text-right">$178,829</td>
                <td className="border p-2 text-right">41.9%</td>
                <td className="border p-2">Maintain current levels</td>
              </tr>
              <tr>
                <td className="border p-2">Admin Contract Labour</td>
                <td className="border p-2 text-right">$162,324</td>
                <td className="border p-2 text-right">38.0%</td>
                <td className="border p-2">Maintain current levels</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border p-2 font-semibold" colSpan={4}>NEW OPERATIONAL INITIATIVES (20.1%)</td>
              </tr>
              <tr>
                <td className="border p-2">Shunting Optimization</td>
                <td className="border p-2 text-right">$31,800</td>
                <td className="border p-2 text-right">7.4%</td>
                <td className="border p-2">Schedule optimization</td>
              </tr>
              <tr>
                <td className="border p-2">Forklift Rental Reduction</td>
                <td className="border p-2 text-right">$25,000</td>
                <td className="border p-2 text-right">5.9%</td>
                <td className="border p-2">Return 2 units</td>
              </tr>
              <tr>
                <td className="border p-2">Garbage Disposal</td>
                <td className="border p-2 text-right">$15,600</td>
                <td className="border p-2 text-right">3.7%</td>
                <td className="border p-2">Frequency adjustment</td>
              </tr>
              <tr>
                <td className="border p-2">Cargo Claims (10%)</td>
                <td className="border p-2 text-right">$13,448</td>
                <td className="border p-2 text-right">3.1%</td>
                <td className="border p-2">Enhanced procedures</td>
              </tr>
              <tr className="bg-green-100 font-semibold">
                <td className="border p-2">TOTAL CORE INITIATIVES</td>
                <td className="border p-2 text-right">$427,001</td>
                <td className="border p-2 text-right">100%</td>
                <td className="border p-2">July 2025 launch</td>
              </tr>
            </tbody>
          </table>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-amber-800 mb-2">Optional Initiative: Security Optimization</h4>
            <p className="text-sm">An additional $91,000 in savings is available through comprehensive security coverage optimization. 
            This would bring total savings to $518,001 (134% of target) if needed.</p>
          </div>

          <h3 className="text-2xl font-bold mt-8 mb-4">FINANCIAL IMPACT ANALYSIS</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-3">Implementation Investment</h4>
              <ul className="text-sm space-y-2">
                <li>• Period: Sep 2024 - Feb 2025</li>
                <li>• Excess costs: $341,153</li>
                <li>• Primary driver: Go-live delays</li>
                <li>• Peak impact: 76.12% cost ratio</li>
              </ul>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-3">Ongoing Returns</h4>
              <ul className="text-sm space-y-2">
                <li>• Efficiency gain: 6.6%</li>
                <li>• Monthly savings: ~$109,000</li>
                <li>• Payback period: 4 months</li>
                <li>• Annual benefit: $1.3M+</li>
              </ul>
            </div>
          </div>

          <h3 className="text-2xl font-bold mt-8 mb-4">RECOMMENDATION</h3>
          <p className="mb-4">
            The Mississauga Terminal management recommends proceeding with all identified core initiatives totaling $427,001. 
            This plan exceeds our F26 target by 10% while maintaining operational excellence. The optional security initiative 
            provides additional flexibility if needed.
          </p>

          <p className="mb-4">
            Key success factors:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>79.9% of savings come from maintaining current efficiency levels (low risk)</li>
            <li>All new initiatives have clear implementation paths</li>
            <li>Monthly monitoring ensures performance sustainability</li>
            <li>Optional initiatives provide cushion above target</li>
          </ul>

          <div className="bg-gray-100 p-4 rounded-lg text-center mt-8">
            <p className="font-semibold">Status: Ready for July 2025 implementation</p>
            <p className="text-sm text-gray-600 mt-1">110% of target identified • 4-month payback achieved • Excellence sustained</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;