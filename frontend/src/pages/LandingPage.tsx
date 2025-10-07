import React from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Shield,
  BarChart3,
  Users,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
} from "lucide-react";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black relative overflow-hidden">
      {/* 3D Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(56,189,248,0.15)_0%,transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.1)_0%,transparent_50%)]"></div>

      {/* Animated Floating Elements */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>

      {/* Navigation */}
      <nav className="glass-nav border-b border-white/10 backdrop-blur-xl relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img
                src="/onlylogo.png"
                alt="FinTemple"
                className="h-8 sm:h-10 md:h-12 lg:h-14 w-auto object-contain"
                style={{ maxWidth: "160px" }}
              />
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                to="/login"
                className="text-slate-300 hover:text-white transition-all duration-300 text-sm sm:text-base px-2 py-1 sm:px-0 sm:py-0"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 sm:pt-20 md:pt-24 pb-20 sm:pb-24 md:pb-32 px-4 sm:px-6 lg:px-8 relative z-30">
        <div className="max-w-7xl mx-auto text-center">
          {/* Premium Badge */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 mb-6 sm:mb-8">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
            <span className="text-xs sm:text-sm font-semibold text-blue-400">
              PROFESSIONAL TRADING PLATFORM
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Master Your
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
              {" "}
              Trading Journey
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-300 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-2">
            Advanced analytics, real-time insights, and professional-grade tools
            for{" "}
            <span className="text-blue-400 font-semibold">serious traders</span>{" "}
            making smarter decisions.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <Link
              to="/register"
              className="group bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center justify-center space-x-2 sm:space-x-3 w-full sm:w-auto"
            >
              <span>Start Trading Smart</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="group glass border border-white/20 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-white/10 transition-all duration-300 transform hover:scale-105 backdrop-blur-xl flex items-center justify-center space-x-2 w-full sm:w-auto"
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
              <span>Sign In</span>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mt-12 sm:mt-16 max-w-2xl mx-auto">
            {[
              { value: "10K+", label: "Active Traders" },
              { value: "₹2.5Cr+", label: "Daily Volume" },
              { value: "98%", label: "Accuracy Rate" },
              { value: "24/7", label: "Live Support" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-slate-400 mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative z-30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              Enterprise-Grade Trading Tools
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto px-4">
              Built with cutting-edge technology to give you the competitive
              edge in today's markets.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                icon: TrendingUp,
                title: "Advanced Analytics",
                description:
                  "Real-time performance metrics and predictive insights.",
                gradient: "from-green-500 to-emerald-500",
              },
              {
                icon: BarChart3,
                title: "Smart Reporting",
                description:
                  "AI-powered insights and automated performance reports.",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: Shield,
                title: "Bank-Level Security",
                description:
                  "Military-grade encryption and secure cloud infrastructure.",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: Users,
                title: "Elite Community",
                description:
                  "Connect with top traders and share proven strategies.",
                gradient: "from-orange-500 to-red-500",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group glass-card p-4 sm:p-6 text-center backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10"
              >
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative z-30">
        <div className="max-w-4xl mx-auto text-center glass-card p-8 sm:p-12 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 transform hover:-translate-y-1">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg shadow-blue-500/25">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
            Ready to Elevate Your Trading?
          </h2>
          <p className="text-lg sm:text-xl text-slate-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Join the elite community of traders who trust FinTemple for their
            most important financial decisions.
          </p>
          <Link
            to="/register"
            className="group bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 inline-flex items-center justify-center space-x-2 sm:space-x-3 w-full sm:w-auto"
          >
            <span>Create Your Professional Account</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative z-30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <img
              src="/onlylogo.png"
              alt="FinTemple"
              className="h-6 sm:h-8 w-auto object-contain"
              style={{ maxWidth: "120px" }}
            />
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            © 2024 FinTemple. Professional trading platform for serious
            investors.
          </p>
        </div>
      </footer>

      {/* Add custom styles for animations */}
      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 6s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
