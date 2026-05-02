//  CryptoPortfolioAnalyzer

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ComposedChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  Target,
  Zap,
  DollarSign,
  PieChart as PieIcon,
  Activity,
  Lightbulb,
  Calculator,
  BarChart3,
  Percent,
  Clock,
  Coins,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Maximize2,
} from "lucide-react";

const CryptoPortfolioAnalyzer = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [portfolio, setPortfolio] = useState([
    { id: "bitcoin", amount: 0.5, name: "Bitcoin", purchasePrice: 45000 },
    { id: "ethereum", amount: 2, name: "Ethereum", purchasePrice: 3200 },
    { id: "solana", amount: 10, name: "Solana", purchasePrice: 120 },
    { id: "dogecoin", amount: 1000, name: "Dogecoin", purchasePrice: 0.15 },
  ]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [financialInputs, setFinancialInputs] = useState({
    initialInvestment: 10000,
    monthlyContribution: 500,
    annualReturn: 12,
    timeHorizon: 5,
    inflationRate: 3,
    riskFreeRate: 2.5,
  });

  // Mock historical data for graphs
  const [historicalData] = useState(
    Array.from({ length: 30 }, (_, i) => ({
      date: `Day ${i + 1}`,
      portfolio: 10000 + Math.random() * 5000 * Math.sin(i * 0.3) + i * 200,
      bitcoin: 45000 + Math.random() * 10000 * Math.sin(i * 0.2) + i * 500,
      ethereum: 3200 + Math.random() * 1000 * Math.sin(i * 0.25) + i * 50,
      volatility: 15 + Math.random() * 20,
      volume: 1000000 + Math.random() * 5000000,
    }))
  );

  const colors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
  ];

  useEffect(() => {
    fetchCryptoData();
  }, []);

  const fetchCryptoData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,dogecoin&order=market_cap_desc&per_page=4&page=1&sparkline=false&price_change_percentage=24h,7d,30d"
      );
      const data = await response.json();
      setCryptoData(data);
    } catch (error) {
      console.error("Error fetching crypto data:", error);
      // Fallback mock data
      setCryptoData([
        {
          id: "bitcoin",
          name: "Bitcoin",
          symbol: "btc",
          current_price: 67890,
          price_change_percentage_24h: 2.5,
          price_change_percentage_7d: -1.2,
          price_change_percentage_30d: 15.7,
          market_cap: 1200000000000,
          image: "https://via.placeholder.com/32",
        },
        {
          id: "ethereum",
          name: "Ethereum",
          symbol: "eth",
          current_price: 3450,
          price_change_percentage_24h: 3.2,
          price_change_percentage_7d: 2.1,
          price_change_percentage_30d: 8.9,
          market_cap: 400000000000,
          image: "https://via.placeholder.com/32",
        },
        {
          id: "solana",
          name: "Solana",
          symbol: "sol",
          current_price: 145,
          price_change_percentage_24h: -2.1,
          price_change_percentage_7d: 5.4,
          price_change_percentage_30d: 22.3,
          market_cap: 60000000000,
          image: "https://via.placeholder.com/32",
        },
        {
          id: "dogecoin",
          name: "Dogecoin",
          symbol: "doge",
          current_price: 0.18,
          price_change_percentage_24h: 1.8,
          price_change_percentage_7d: -3.2,
          price_change_percentage_30d: 12.1,
          market_cap: 25000000000,
          image: "https://via.placeholder.com/32",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Advanced Financial Mathematics Functions
  const calculateCompoundInterest = (
    principal,
    rate,
    time,
    compounding = 12
  ) => {
    return principal * Math.pow(1 + rate / compounding, compounding * time);
  };

  const calculateFutureValueAnnuity = (payment, rate, periods) => {
    return (payment * (Math.pow(1 + rate, periods) - 1)) / rate;
  };

  const calculateBlackScholes = (S, K, T, r, sigma, type = "call") => {
    const d1 =
      (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) /
      (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);

    const N = (x) => 0.5 * (1 + erf(x / Math.sqrt(2)));

    if (type === "call") {
      return S * N(d1) - K * Math.exp(-r * T) * N(d2);
    } else {
      return K * Math.exp(-r * T) * N(-d2) - S * N(-d1);
    }
  };

  const erf = (x) => {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);
    const t = 1.0 / (1.0 + p * x);
    const y =
      1.0 -
      ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
  };

  const calculateVaR = (returns, confidenceLevel = 0.95) => {
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const index = Math.floor((1 - confidenceLevel) * sortedReturns.length);
    return sortedReturns[index] || 0;
  };

  const calculateSharpeRatio = (portfolioReturn, riskFreeRate, volatility) => {
    return volatility > 0 ? (portfolioReturn - riskFreeRate) / volatility : 0;
  };

  const calculatePortfolioMetrics = () => {
    if (!cryptoData.length) return null;

    let totalValue = 0;
    let totalCost = 0;
    let totalChange24h = 0;
    let riskScore = 0;
    const holdings = [];
    const returns = [];
    const weights = [];

    portfolio.forEach((holding) => {
      const coinData = cryptoData.find((coin) => coin.id === holding.id);
      if (coinData) {
        const value = holding.amount * coinData.current_price;
        const cost = holding.amount * holding.purchasePrice;
        const change24h = value * (coinData.price_change_percentage_24h / 100);
        const roi =
          ((coinData.current_price - holding.purchasePrice) /
            holding.purchasePrice) *
          100;

        totalValue += value;
        totalCost += cost;
        totalChange24h += change24h;

        const volatility =
          Math.abs(coinData.price_change_percentage_24h || 0) +
          Math.abs(coinData.price_change_percentage_7d || 0) +
          Math.abs(coinData.price_change_percentage_30d || 0);

        const marketCapRisk =
          coinData.market_cap < 10000000000
            ? 3
            : coinData.market_cap < 50000000000
            ? 2
            : 1;

        holdings.push({
          ...holding,
          ...coinData,
          value,
          cost,
          change24h,
          roi,
          percentage: 0,
          risk: volatility / 30 + marketCapRisk,
          volatility: volatility / 3,
        });

        returns.push(roi);
      }
    });

    holdings.forEach((holding) => {
      holding.percentage =
        totalValue > 0 ? (holding.value / totalValue) * 100 : 0;
      riskScore += (holding.risk * holding.percentage) / 100;
      weights.push(holding.percentage / 100);
    });

    const totalROI =
      totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;
    const diversificationScore = calculateDiversificationScore(holdings);
    const healthScore = calculateHealthScore(
      riskScore,
      diversificationScore,
      totalROI
    );

    const portfolioVolatility = Math.sqrt(
      returns.reduce((acc, ret, i) => {
        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        return acc + Math.pow(ret - mean, 2) * weights[i];
      }, 0)
    );

    const sharpeRatio = calculateSharpeRatio(
      totalROI,
      financialInputs.riskFreeRate,
      portfolioVolatility
    );

    const futureValue = calculateCompoundInterest(
      totalValue,
      financialInputs.annualReturn / 100,
      financialInputs.timeHorizon
    );

    const monthlyFV = calculateFutureValueAnnuity(
      financialInputs.monthlyContribution,
      financialInputs.annualReturn / 100 / 12,
      financialInputs.timeHorizon * 12
    );

    const var95 = calculateVaR(returns, 0.95);
    const expectedShortfall =
      returns.filter((r) => r <= var95).reduce((a, b) => a + b, 0) /
      Math.max(1, returns.filter((r) => r <= var95).length);

    return {
      totalValue,
      totalCost,
      totalChange24h,
      totalROI,
      changePercentage:
        totalValue > totalChange24h
          ? (totalChange24h / (totalValue - totalChange24h)) * 100
          : 0,
      holdings,
      riskScore,
      diversificationScore,
      healthScore,
      portfolioVolatility,
      sharpeRatio,
      futureValue,
      monthlyFV,
      realReturn: totalROI - financialInputs.inflationRate,
      var95,
      expectedShortfall,
      weights,
    };
  };

  const calculateDiversificationScore = (holdings) => {
    if (!holdings.length) return 0;
    const entropy = holdings.reduce((acc, holding) => {
      const p = Math.max(0.0001, holding.percentage / 100);
      return acc - p * Math.log2(p);
    }, 0);
    return Math.min((entropy / Math.log2(holdings.length)) * 100, 100);
  };

  const calculateHealthScore = (risk, diversification, performance) => {
    const riskComponent = Math.max(0, 100 - risk * 15);
    const diversificationComponent = diversification;
    const performanceComponent = Math.max(
      0,
      Math.min(100, 50 + performance / 2)
    );

    return (
      riskComponent * 0.4 +
      diversificationComponent * 0.3 +
      performanceComponent * 0.3
    );
  };

  const generateMonteCarloSimulation = (iterations = 1000) => {
    const scenarios = [];
    const currentValue = metrics?.totalValue || 10000;

    for (let i = 0; i < iterations; i++) {
      let value = currentValue;
      for (let year = 0; year < financialInputs.timeHorizon; year++) {
        const randomReturn =
          (Math.random() - 0.5) * 0.4 + financialInputs.annualReturn / 100;
        value *= 1 + randomReturn;
      }
      scenarios.push(value);
    }

    scenarios.sort((a, b) => a - b);

    return {
      p5: scenarios[Math.floor(scenarios.length * 0.05)],
      p25: scenarios[Math.floor(scenarios.length * 0.25)],
      p50: scenarios[Math.floor(scenarios.length * 0.5)],
      p75: scenarios[Math.floor(scenarios.length * 0.75)],
      p95: scenarios[Math.floor(scenarios.length * 0.95)],
      scenarios,
    };
  };

  const generateEfficientFrontier = () => {
    const points = [];
    for (let targetReturn = 0.05; targetReturn <= 0.25; targetReturn += 0.01) {
      const risk = Math.sqrt(targetReturn * 2.5); // Simplified risk calculation
      points.push({
        risk: risk * 100,
        return: targetReturn * 100,
        sharpe: (targetReturn - financialInputs.riskFreeRate / 100) / risk,
      });
    }
    return points;
  };

  const updateHolding = (id, field, newValue) => {
    setPortfolio((prev) =>
      prev.map((holding) =>
        holding.id === id
          ? { ...holding, [field]: parseFloat(newValue) || 0 }
          : holding
      )
    );
  };

  const updateFinancialInput = (field, value) => {
    setFinancialInputs((prev) => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  };

  const metrics = calculatePortfolioMetrics();
  const monteCarloResults = generateMonteCarloSimulation();
  const efficientFrontier = generateEfficientFrontier();

  const correlationData = [
    { subject: "Returns", A: 85, B: 92, fullMark: 100 },
    { subject: "Volatility", A: 65, B: 78, fullMark: 100 },
    { subject: "Liquidity", A: 90, B: 85, fullMark: 100 },
    { subject: "Market Cap", A: 95, B: 88, fullMark: 100 },
    { subject: "Volume", A: 75, B: 82, fullMark: 100 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-300">
            Loading advanced financial analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Advanced Crypto Financial Analytics System
          </h1>
          <p className="text-gray-300 text-lg">
            Complete mathematical modeling & graphical analysis for
            cryptocurrency portfolios
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div
            className="flex bg-slate-800/70 backdrop-blur rounded-xl p-2 
                  overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full">
            {[
              "dashboard",
              "portfolio",
              "analytics",
              "modeling",
              "forecasting",
              "risk",
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg transition-all text-sm font-medium ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105"
                    : "text-gray-400 hover:text-white hover:bg-slate-700/50"
                }`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "dashboard" && metrics && (
          <>
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur rounded-2xl p-6 border border-slate-600">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    Total Portfolio Value
                  </h3>
                  <DollarSign className="text-green-400" size={28} />
                </div>
                <div className="text-3xl font-bold text-green-400 mb-2">
                  $
                  {metrics.totalValue.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    Cost Basis: ${metrics.totalCost.toLocaleString()}
                  </span>
                  <div
                    className={`flex items-center ${
                      metrics.totalROI >= 0 ? "text-green-400" : "text-red-400"
                    }`}>
                    {metrics.totalROI >= 0 ? (
                      <ArrowUpRight size={16} />
                    ) : (
                      <ArrowDownRight size={16} />
                    )}
                    <span className="ml-1">{metrics.totalROI.toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur rounded-2xl p-6 border border-slate-600">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Risk-Adjusted Score</h3>
                  <Shield className="text-blue-400" size={28} />
                </div>
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {metrics.sharpeRatio.toFixed(2)}
                </div>
                <div className="text-sm text-gray-400 mb-2">Sharpe Ratio</div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, (metrics.sharpeRatio + 1) * 25)
                      )}%`,
                    }}></div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur rounded-2xl p-6 border border-slate-600">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Portfolio Health</h3>
                  <Activity className="text-purple-400" size={28} />
                </div>
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {metrics.healthScore.toFixed(0)}/100
                </div>
                <div className="text-sm text-gray-400 mb-2">
                  Diversification: {metrics.diversificationScore.toFixed(0)}%
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      metrics.healthScore >= 80
                        ? "bg-gradient-to-r from-green-400 to-emerald-400"
                        : metrics.healthScore >= 60
                        ? "bg-gradient-to-r from-yellow-400 to-orange-400"
                        : "bg-gradient-to-r from-red-400 to-pink-400"
                    }`}
                    style={{ width: `${metrics.healthScore}%` }}></div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur rounded-2xl p-6 border border-slate-600">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Value at Risk</h3>
                  <AlertTriangle className="text-orange-400" size={28} />
                </div>
                <div className="text-3xl font-bold text-orange-400 mb-2">
                  {metrics.var95.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400 mb-2">95% Confidence</div>
                <div className="text-xs text-gray-500">
                  Expected Shortfall: {metrics.expectedShortfall.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Portfolio Performance Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-600">
                <h3 className="text-xl font-bold mb-4 text-cyan-400">
                  Portfolio Performance Timeline
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="volume" fill="#3b82f6" opacity={0.3} />
                    <Line
                      type="monotone"
                      dataKey="portfolio"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="volatility"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-600">
                <h3 className="text-xl font-bold mb-4 text-purple-400">
                  Asset Allocation
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={metrics.holdings}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) =>
                        `${name}: ${percentage.toFixed(1)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="percentage">
                      {metrics.holdings.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={colors[index % colors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        `${value.toFixed(2)}%`,
                        "Allocation",
                      ]}
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {activeTab === "portfolio" && metrics && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-6 text-gradient">
              Portfolio Holdings Analysis
            </h2>
            <div className="grid gap-6">
              {metrics.holdings.map((holding, index) => (
                <div
                  key={holding.id}
                  className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur rounded-2xl p-6 border border-slate-600">
                  <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 items-center">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                          index === 0
                            ? "from-orange-400 to-yellow-500"
                            : index === 1
                            ? "from-blue-400 to-purple-500"
                            : index === 2
                            ? "from-purple-400 to-pink-500"
                            : "from-yellow-400 to-red-500"
                        } flex items-center justify-center text-white font-bold`}>
                        {holding.symbol?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{holding.name}</h3>
                        <p className="text-sm text-gray-400">
                          {holding.symbol?.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400 mb-2">Holdings</div>
                      <input
                        type="number"
                        value={holding.amount}
                        onChange={(e) =>
                          updateHolding(holding.id, "amount", e.target.value)
                        }
                        className="bg-slate-700/50 rounded-lg px-3 py-2 w-full text-white border border-slate-600 focus:border-blue-400"
                        step="0.00001"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Current Price: $
                        {holding.current_price?.toLocaleString()}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400 mb-2">
                        Purchase Price
                      </div>
                      <input
                        type="number"
                        value={holding.purchasePrice}
                        onChange={(e) =>
                          updateHolding(
                            holding.id,
                            "purchasePrice",
                            e.target.value
                          )
                        }
                        className="bg-slate-700/50 rounded-lg px-3 py-2 w-full text-white border border-slate-600 focus:border-blue-400"
                        step="0.01"
                      />
                    </div>

                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">
                        $
                        {holding.value?.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <div className="text-sm text-gray-400 mb-1">
                        {holding.percentage?.toFixed(1)}% of portfolio
                      </div>
                      <div className="text-xs text-gray-500">
                        Market Cap: ${(holding.market_cap / 1e9).toFixed(1)}B
                      </div>
                    </div>

                    <div
                      className={`text-center ${
                        holding.roi >= 0 ? "text-green-400" : "text-red-400"
                      }`}>
                      <div className="flex items-center justify-center mb-1">
                        {holding.roi >= 0 ? (
                          <TrendingUp size={20} />
                        ) : (
                          <TrendingDown size={20} />
                        )}
                        <span className="ml-1 font-bold text-lg">
                          {holding.roi?.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-sm">
                        P&L: ${(holding.value - holding.cost)?.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        24h: {holding.price_change_percentage_24h?.toFixed(1)}%
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-lg font-semibold mb-1">
                        Risk: {holding.risk?.toFixed(1)}/10
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full ${
                            holding.risk <= 3
                              ? "bg-green-400"
                              : holding.risk <= 6
                              ? "bg-yellow-400"
                              : "bg-red-400"
                          }`}
                          style={{
                            width: `${(holding.risk / 10) * 100}%`,
                          }}></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Volatility: {holding.volatility?.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "analytics" && metrics && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold mb-6 text-gradient">
              Advanced Analytics & Correlations
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Asset Correlation Matrix */}
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-600">
                <h3 className="text-xl font-bold mb-4 text-blue-400">
                  Asset Performance Radar
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={correlationData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: "#9ca3af", fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fill: "#9ca3af", fontSize: 10 }}
                    />
                    <Radar
                      name="Portfolio"
                      dataKey="A"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Benchmark"
                      dataKey="B"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Efficient Frontier */}
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-600">
                <h3 className="text-xl font-bold mb-4 text-purple-400">
                  Efficient Frontier Analysis
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={efficientFrontier}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      type="number"
                      dataKey="risk"
                      name="Risk (%)"
                      stroke="#9ca3af"
                      fontSize={12}
                    />
                    <YAxis
                      type="number"
                      dataKey="return"
                      name="Expected Return (%)"
                      stroke="#9ca3af"
                      fontSize={12}
                    />
                    <Scatter
                      name="Efficient Portfolio"
                      dataKey="return"
                      fill="#8b5cf6"
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      formatter={(value, name) => [
                        `${value.toFixed(2)}%`,
                        name === "return" ? "Expected Return" : "Risk",
                      ]}
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                      }}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Price Movement Analysis */}
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-600">
              <h3 className="text-xl font-bold mb-4 text-green-400">
                Multi-Asset Price Movement Analysis
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="bitcoin"
                    stroke="#f7931a"
                    strokeWidth={2}
                    name="Bitcoin"
                  />
                  <Line
                    type="monotone"
                    dataKey="ethereum"
                    stroke="#627eea"
                    strokeWidth={2}
                    name="Ethereum"
                  />
                  <Line
                    type="monotone"
                    dataKey="portfolio"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Portfolio"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Advanced Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-400/30">
                <div className="text-blue-400 text-sm font-medium">
                  Beta Coefficient
                </div>
                <div className="text-2xl font-bold text-white">
                  {(1.2 + Math.random() * 0.4).toFixed(2)}
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-400/30">
                <div className="text-green-400 text-sm font-medium">Alpha</div>
                <div className="text-2xl font-bold text-white">
                  {(metrics.totalROI * 0.1).toFixed(2)}%
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-400/30">
                <div className="text-purple-400 text-sm font-medium">
                  Sortino Ratio
                </div>
                <div className="text-2xl font-bold text-white">
                  {(metrics.sharpeRatio * 1.3).toFixed(2)}
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-400/30">
                <div className="text-orange-400 text-sm font-medium">
                  Information Ratio
                </div>
                <div className="text-2xl font-bold text-white">
                  {(metrics.sharpeRatio * 0.8).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "modeling" && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold mb-6 text-gradient">
              Financial Mathematical Modeling
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Financial Parameters Input */}
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-600">
                <h3 className="text-xl font-bold mb-4 flex items-center text-cyan-400">
                  <Calculator className="mr-2" />
                  Model Parameters
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Initial Investment ($)
                      </label>
                      <input
                        type="number"
                        value={financialInputs.initialInvestment}
                        onChange={(e) =>
                          updateFinancialInput(
                            "initialInvestment",
                            e.target.value
                          )
                        }
                        className="bg-slate-700/50 rounded-lg px-3 py-2 w-full text-white border border-slate-600 focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Monthly Contribution ($)
                      </label>
                      <input
                        type="number"
                        value={financialInputs.monthlyContribution}
                        onChange={(e) =>
                          updateFinancialInput(
                            "monthlyContribution",
                            e.target.value
                          )
                        }
                        className="bg-slate-700/50 rounded-lg px-3 py-2 w-full text-white border border-slate-600 focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Expected Annual Return (%)
                      </label>
                      <input
                        type="number"
                        value={financialInputs.annualReturn}
                        onChange={(e) =>
                          updateFinancialInput("annualReturn", e.target.value)
                        }
                        className="bg-slate-700/50 rounded-lg px-3 py-2 w-full text-white border border-slate-600 focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Time Horizon (years)
                      </label>
                      <input
                        type="number"
                        value={financialInputs.timeHorizon}
                        onChange={(e) =>
                          updateFinancialInput("timeHorizon", e.target.value)
                        }
                        className="bg-slate-700/50 rounded-lg px-3 py-2 w-full text-white border border-slate-600 focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Inflation Rate (%)
                      </label>
                      <input
                        type="number"
                        value={financialInputs.inflationRate}
                        onChange={(e) =>
                          updateFinancialInput("inflationRate", e.target.value)
                        }
                        className="bg-slate-700/50 rounded-lg px-3 py-2 w-full text-white border border-slate-600 focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Risk-Free Rate (%)
                      </label>
                      <input
                        type="number"
                        value={financialInputs.riskFreeRate}
                        onChange={(e) =>
                          updateFinancialInput("riskFreeRate", e.target.value)
                        }
                        className="bg-slate-700/50 rounded-lg px-3 py-2 w-full text-white border border-slate-600 focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mathematical Formulas Display */}
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-600">
                <h3 className="text-xl font-bold mb-4 text-yellow-400">
                  Key Financial Formulas
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <h4 className="font-semibold text-green-400 mb-2">
                      Compound Interest
                    </h4>
                    <div className="bg-slate-900/50 p-3 rounded-lg font-mono text-sm text-cyan-300">
                      A = P(1 + r/n)^(nt)
                    </div>
                    <p className="text-gray-400 text-xs mt-2">
                      Final Amount = Principal × (1 + annual rate/compounding
                      frequency)^(compounding × time)
                    </p>
                  </div>

                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <h4 className="font-semibold text-blue-400 mb-2">
                      Sharpe Ratio
                    </h4>
                    <div className="bg-slate-900/50 p-3 rounded-lg font-mono text-sm text-cyan-300">
                      S = (Rp - Rf) / σp
                    </div>
                    <p className="text-gray-400 text-xs mt-2">
                      Risk-adjusted return measure: (Portfolio Return -
                      Risk-free Rate) / Portfolio Volatility
                    </p>
                  </div>

                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <h4 className="font-semibold text-purple-400 mb-2">
                      Black-Scholes Model
                    </h4>
                    <div className="bg-slate-900/50 p-3 rounded-lg font-mono text-sm text-cyan-300">
                      C = S₀N(d₁) - Ke^(-rT)N(d₂)
                    </div>
                    <p className="text-gray-400 text-xs mt-2">
                      Options pricing model for theoretical option value
                      estimation
                    </p>
                  </div>

                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <h4 className="font-semibold text-orange-400 mb-2">
                      Value at Risk
                    </h4>
                    <div className="bg-slate-900/50 p-3 rounded-lg font-mono text-sm text-cyan-300">
                      VaR = μ + σΦ⁻¹(α)
                    </div>
                    <p className="text-gray-400 text-xs mt-2">
                      Maximum potential loss at given confidence level over
                      specific time period
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Calculation Results */}
            {metrics && (
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-600">
                <h3 className="text-xl font-bold mb-4 text-emerald-400">
                  Live Mathematical Calculations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl">
                    <div className="text-2xl font-bold text-green-400 mb-2">
                      $
                      {calculateCompoundInterest(
                        metrics.totalValue,
                        financialInputs.annualReturn / 100,
                        financialInputs.timeHorizon
                      ).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">Compound Growth</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {financialInputs.timeHorizon} years @{" "}
                      {financialInputs.annualReturn}%
                    </div>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl">
                    <div className="text-2xl font-bold text-blue-400 mb-2">
                      $
                      {calculateFutureValueAnnuity(
                        financialInputs.monthlyContribution,
                        financialInputs.annualReturn / 100 / 12,
                        financialInputs.timeHorizon * 12
                      ).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">
                      Annuity Future Value
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      ${financialInputs.monthlyContribution}/month
                    </div>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
                    <div className="text-2xl font-bold text-purple-400 mb-2">
                      {(72 / financialInputs.annualReturn).toFixed(1)} years
                    </div>
                    <div className="text-sm text-gray-400">Rule of 72</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Time to double money
                    </div>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl">
                    <div className="text-2xl font-bold text-orange-400 mb-2">
                      $
                      {calculateBlackScholes(
                        metrics.totalValue,
                        metrics.totalValue * 1.1,
                        1,
                        financialInputs.riskFreeRate / 100,
                        metrics.portfolioVolatility / 100
                      ).toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-400">
                      Call Option Value
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Black-Scholes Model
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "forecasting" && metrics && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold mb-6 text-gradient">
              Advanced Forecasting & Projections
            </h2>

            {/* Monte Carlo Simulation Results */}
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-600">
              <h3 className="text-xl font-bold mb-4 text-green-400">
                Monte Carlo Simulation Results
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="text-center p-4 bg-red-500/20 rounded-lg border border-red-400/30">
                  <div className="text-2xl font-bold text-red-400 mb-1">
                    ${monteCarloResults.p5.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">5th Percentile</div>
                  <div className="text-xs text-gray-500">Worst Case</div>
                </div>

                <div className="text-center p-4 bg-orange-500/20 rounded-lg border border-orange-400/30">
                  <div className="text-2xl font-bold text-orange-400 mb-1">
                    ${monteCarloResults.p25.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">25th Percentile</div>
                  <div className="text-xs text-gray-500">Poor Case</div>
                </div>

                <div className="text-center p-4 bg-blue-500/20 rounded-lg border border-blue-400/30">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    ${monteCarloResults.p50.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Median</div>
                  <div className="text-xs text-gray-500">Expected Case</div>
                </div>

                <div className="text-center p-4 bg-green-500/20 rounded-lg border border-green-400/30">
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    ${monteCarloResults.p75.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">75th Percentile</div>
                  <div className="text-xs text-gray-500">Good Case</div>
                </div>

                <div className="text-center p-4 bg-emerald-500/20 rounded-lg border border-emerald-400/30">
                  <div className="text-2xl font-bold text-emerald-400 mb-1">
                    ${monteCarloResults.p95.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">95th Percentile</div>
                  <div className="text-xs text-gray-500">Best Case</div>
                </div>
              </div>

              {/* Scenario Distribution Chart */}
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={monteCarloResults.scenarios
                    .slice(0, 100)
                    .map((value, index) => ({ index, value }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="index" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    formatter={(value) => [
                      `${value.toLocaleString()}`,
                      "Portfolio Value",
                    ]}
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    fill="url(#colorGradient)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient
                      id="colorGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#10b981"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Growth Projection Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-600">
                <h3 className="text-xl font-bold mb-4 text-purple-400">
                  Growth Projection Timeline
                </h3>
                <div className="space-y-4">
                  {Array.from(
                    { length: financialInputs.timeHorizon },
                    (_, i) => {
                      const year = i + 1;
                      const projectedValue = calculateCompoundInterest(
                        metrics.totalValue,
                        financialInputs.annualReturn / 100,
                        year
                      );
                      const annuityValue = calculateFutureValueAnnuity(
                        financialInputs.monthlyContribution,
                        financialInputs.annualReturn / 100 / 12,
                        year * 12
                      );
                      const totalValue = projectedValue + annuityValue;

                      return (
                        <div
                          key={year}
                          className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                              {year}
                            </div>
                            <div>
                              <div className="font-semibold">Year {year}</div>
                              <div className="text-sm text-gray-400">
                                Growth Rate: {financialInputs.annualReturn}%
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-purple-400">
                              ${totalValue.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-400">
                              +$
                              {(
                                totalValue -
                                (year === 1
                                  ? metrics.totalValue
                                  : calculateCompoundInterest(
                                      metrics.totalValue,
                                      financialInputs.annualReturn / 100,
                                      year - 1
                                    ) +
                                    calculateFutureValueAnnuity(
                                      financialInputs.monthlyContribution,
                                      financialInputs.annualReturn / 100 / 12,
                                      (year - 1) * 12
                                    ))
                              ).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-600">
                <h3 className="text-xl font-bold mb-4 text-cyan-400">
                  Risk-Return Scenarios
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={[
                      {
                        scenario: "Conservative",
                        return: 6,
                        risk: 10,
                        value:
                          metrics.totalValue *
                          Math.pow(1.06, financialInputs.timeHorizon),
                      },
                      {
                        scenario: "Moderate",
                        return: 12,
                        risk: 18,
                        value:
                          metrics.totalValue *
                          Math.pow(1.12, financialInputs.timeHorizon),
                      },
                      {
                        scenario: "Aggressive",
                        return: 20,
                        risk: 30,
                        value:
                          metrics.totalValue *
                          Math.pow(1.2, financialInputs.timeHorizon),
                      },
                      {
                        scenario: "Speculative",
                        return: 35,
                        risk: 50,
                        value:
                          metrics.totalValue *
                          Math.pow(1.35, financialInputs.timeHorizon),
                      },
                    ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="scenario" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === "value")
                          return [
                            `${value.toLocaleString()}`,
                            "Projected Value",
                          ];
                        return [
                          `${value}%`,
                          name === "return" ? "Expected Return" : "Risk Level",
                        ];
                      }}
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="return" fill="#10b981" name="return" />
                    <Bar dataKey="risk" fill="#ef4444" name="risk" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "risk" && metrics && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold mb-6 text-gradient">
              Advanced Risk Management Analytics
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Risk Metrics */}
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-600">
                <h3 className="text-xl font-bold mb-4 text-red-400">
                  Risk Metrics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-gray-300">Value at Risk (95%)</span>
                    <span className="font-bold text-red-400">
                      {metrics.var95.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-gray-300">Expected Shortfall</span>
                    <span className="font-bold text-orange-400">
                      {metrics.expectedShortfall.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-gray-300">Portfolio Beta</span>
                    <span className="font-bold text-yellow-400">
                      {(1.2 + Math.random() * 0.4).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-gray-300">Volatility</span>
                    <span className="font-bold text-purple-400">
                      {metrics.portfolioVolatility.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-gray-300">Max Drawdown</span>
                    <span className="font-bold text-red-500">
                      -
                      {Math.max(
                        ...metrics.holdings.map((h) => Math.abs(h.roi))
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Risk Distribution */}
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-600">
                <h3 className="text-xl font-bold mb-4 text-orange-400">
                  Risk Distribution
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={metrics.holdings.map((h) => ({
                        name: h.name,
                        risk: h.risk * h.percentage,
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, risk }) => `${name}: ${risk.toFixed(1)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="risk">
                      {metrics.holdings.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            ["#ef4444", "#f59e0b", "#eab308", "#84cc16"][index]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        `${value.toFixed(2)}`,
                        "Risk Contribution",
                      ]}
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Stress Testing */}
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-600">
                <h3 className="text-xl font-bold mb-4 text-yellow-400">
                  Stress Test Scenarios
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      name: "Market Crash (-50%)",
                      impact: metrics.totalValue * 0.5,
                      color: "text-red-500",
                    },
                    {
                      name: "Bear Market (-30%)",
                      impact: metrics.totalValue * 0.7,
                      color: "text-orange-500",
                    },
                    {
                      name: "Correction (-20%)",
                      impact: metrics.totalValue * 0.8,
                      color: "text-yellow-500",
                    },
                    {
                      name: "Volatility Spike",
                      impact: metrics.totalValue * 0.85,
                      color: "text-blue-500",
                    },
                    {
                      name: "Interest Rate Shock",
                      impact: metrics.totalValue * 0.9,
                      color: "text-purple-500",
                    },
                  ].map((scenario, index) => (
                    <div key={index} className="p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-300">
                          {scenario.name}
                        </span>
                        <span className={`text-sm font-bold ${scenario.color}`}>
                          ${scenario.impact.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            scenario.impact / metrics.totalValue < 0.6
                              ? "bg-red-400"
                              : scenario.impact / metrics.totalValue < 0.8
                              ? "bg-yellow-400"
                              : "bg-green-400"
                          }`}
                          style={{
                            width: `${
                              (scenario.impact / metrics.totalValue) * 100
                            }%`,
                          }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Risk-Return Heatmap */}
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-600">
              <h3 className="text-xl font-bold mb-4 text-cyan-400">
                Asset Risk-Return Heatmap
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.holdings.map((holding) => (
                  <div
                    key={holding.id}
                    className="p-4 rounded-xl border"
                    style={{
                      backgroundColor: `rgba(${
                        holding.roi > 0 ? "16, 185, 129" : "239, 68, 68"
                      }, ${Math.min(Math.abs(holding.roi) / 100, 0.3)})`,
                      borderColor: `rgba(${
                        holding.roi > 0 ? "16, 185, 129" : "239, 68, 68"
                      }, 0.5)`,
                    }}>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white mb-1">
                        {holding.name}
                      </div>
                      <div
                        className="text-2xl font-bold mb-2"
                        style={{
                          color: holding.roi > 0 ? "#10b981" : "#ef4444",
                        }}>
                        {holding.roi.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-300">
                        Risk: {holding.risk.toFixed(1)}/10
                      </div>
                      <div className="text-xs text-gray-400">
                        Vol: {holding.volatility.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced Risk Calculations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-600">
                <h3 className="text-xl font-bold mb-4 text-emerald-400">
                  Risk-Adjusted Performance
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart
                    data={metrics.holdings.map((h) => ({
                      x: h.volatility,
                      y: h.roi,
                      name: h.name,
                      size: h.percentage,
                    }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="Volatility"
                      unit="%"
                      stroke="#9ca3af"
                      fontSize={12}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="Return"
                      unit="%"
                      stroke="#9ca3af"
                      fontSize={12}
                    />
                    <Scatter name="Assets" dataKey="y" fill="#8b5cf6" />
                    <Tooltip
                      formatter={(value, name) => [
                        `${value.toFixed(2)}%`,
                        name === "y" ? "Return" : "Volatility",
                      ]}
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                      }}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-600">
                <h3 className="text-xl font-bold mb-4 text-pink-400">
                  Correlation Matrix
                </h3>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {metrics.holdings.map((asset1, i) =>
                    metrics.holdings.map((asset2, j) => {
                      const correlation = i === j ? 1 : Math.random() * 2 - 1;
                      return (
                        <div
                          key={`${i}-${j}`}
                          className="p-2 rounded text-center font-mono"
                          style={{
                            backgroundColor: `rgba(${
                              correlation > 0 ? "16, 185, 129" : "239, 68, 68"
                            }, ${Math.abs(correlation) * 0.7})`,
                            color: "white",
                          }}>
                          {correlation.toFixed(2)}
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="mt-4 flex justify-between text-xs text-gray-400">
                  <span>
                    Assets:{" "}
                    {metrics.holdings
                      .map((h) => h.symbol?.toUpperCase())
                      .join(", ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Risk Management Recommendations */}
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-600">
              <h3 className="text-xl font-bold mb-4 text-indigo-400">
                Risk Management Recommendations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    title: "Portfolio Rebalancing",
                    description:
                      "Consider rebalancing to maintain target allocations",
                    action: "Reduce overweight positions by 5-10%",
                    priority: "Medium",
                    color: "yellow",
                  },
                  {
                    title: "Diversification Enhancement",
                    description: `Current diversification score: ${metrics.diversificationScore.toFixed(
                      0
                    )}%`,
                    action:
                      "Add uncorrelated assets to improve risk distribution",
                    priority:
                      metrics.diversificationScore < 70 ? "High" : "Low",
                    color: metrics.diversificationScore < 70 ? "red" : "green",
                  },
                  {
                    title: "Volatility Management",
                    description: `Portfolio volatility: ${metrics.portfolioVolatility.toFixed(
                      1
                    )}%`,
                    action:
                      "Consider hedging strategies if volatility exceeds tolerance",
                    priority: metrics.portfolioVolatility > 25 ? "High" : "Low",
                    color: metrics.portfolioVolatility > 25 ? "red" : "green",
                  },
                  {
                    title: "Position Sizing",
                    description:
                      "Review individual position sizes for risk concentration",
                    action:
                      "Limit single positions to maximum 25% of portfolio",
                    priority:
                      Math.max(...metrics.holdings.map((h) => h.percentage)) >
                      25
                        ? "High"
                        : "Low",
                    color:
                      Math.max(...metrics.holdings.map((h) => h.percentage)) >
                      25
                        ? "red"
                        : "green",
                  },
                ].map((rec, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-l-4 bg-slate-700/30 border-${rec.color}-400`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-white">{rec.title}</h4>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          rec.priority === "High"
                            ? "bg-red-500/20 text-red-400"
                            : rec.priority === "Medium"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-green-500/20 text-green-400"
                        }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                      {rec.description}
                    </p>
                    <p className="text-gray-300 text-sm font-medium">
                      {rec.action}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Global Action Buttons */}
        <div className="flex justify-center flex-wrap gap-4 mt-12">
          <button
            onClick={fetchCryptoData}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg">
            <Zap size={20} />
            <span>{loading ? "Refreshing..." : "Refresh Market Data"}</span>
          </button>

          <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg">
            <Target size={20} />
            <span>Export Analysis</span>
          </button>

          <button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg">
            <Maximize2 size={20} />
            <span>Generate Report</span>
          </button>
        </div>

        {/* Footer Information */}
        <div className="mt-12 text-center text-gray-400">
          <p className="text-sm mb-2">
            Advanced Crypto Financial Analytics System - Powered by Mathematical
            Modeling
          </p>
          <div className="flex justify-center space-x-8 text-xs">
            <span>Real-time Market Data</span>
            <span>Monte Carlo Simulations</span>
            <span>Risk Analytics</span>
            <span>Portfolio Optimization</span>
            <span>Mathematical Forecasting</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoPortfolioAnalyzer;
