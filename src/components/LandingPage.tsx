import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Leaf, 
  ChevronRight, 
  Globe, 
  Wallet, 
  BarChart3, 
  Zap, 
  Shield, 
  TrendingUp,
  Users,
  Store,
  ArrowRight,
  Play,
  CheckCircle,
  Star
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const benefits = [
    {
      icon: Shield,
      title: "Transparent Ledger",
      description: "Immutable on-chain sales & funding history",
      gradient: "from-emerald-400 to-teal-400"
    },
    {
      icon: Zap,
      title: "Instant Micro-Loan Access",
      description: "One-click capital for stock, tools & expansion",
      gradient: "from-blue-400 to-cyan-400"
    },
    {
      icon: BarChart3,
      title: "Sustainable Insights",
      description: "AI valuations & green-rating dashboards",
      gradient: "from-purple-400 to-pink-400"
    }
  ];

  const steps = [
    {
      title: "Connect Your POS",
      description: "Scan QR code to link your point-of-sale system",
      icon: Store,
      image: "https://images.pexels.com/photos/4099238/pexels-photo-4099238.jpeg?auto=compress&cs=tinysrgb&w=300"
    },
    {
      title: "Record Sales & Stock",
      description: "Track inventory and sales in real-time",
      icon: BarChart3,
      image: "https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=300"
    },
    {
      title: "Request & Receive Funding",
      description: "Get instant micro-loans from impact investors",
      icon: Wallet,
      image: "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=300"
    },
    {
      title: "Grow & Report Impact",
      description: "Scale sustainably with impact metrics",
      icon: TrendingUp,
      image: "https://images.pexels.com/photos/2380794/pexels-photo-2380794.jpeg?auto=compress&cs=tinysrgb&w=300"
    }
  ];

  const partners = [
    "Green Impact Fund",
    "Southeast Asia Ventures", 
    "Sustainable Growth Capital",
    "Rural Development Bank",
    "EcoFinance Initiative"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 font-inter overflow-x-hidden">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2300C853%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] bg-repeat animate-pulse"></div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-8"
          >
            {/* Logo */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-2xl">
                <Leaf className="w-12 h-12 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  GreenPOS
                </h1>
                <p className="text-lg text-gray-600">Network</p>
              </div>
            </div>

            {/* Main Headline */}
            <h2 className="text-4xl lg:text-7xl font-bold text-gray-800 mb-6 leading-tight">
              Empower Rural Shops with
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent block">
                Real-Time On-Chain Funding
              </span>
            </h2>

            <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              GreenPOS Network: SDG-9 compliant POS + micro-funding platform for sustainable growth
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <motion.button
                onClick={onEnterApp}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 flex items-center gap-3"
              >
                <Wallet className="w-6 h-6" />
                Enter the App
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group px-8 py-4 bg-white/30 backdrop-blur-md border border-white/20 text-gray-700 font-medium rounded-2xl hover:bg-white/40 transition-all duration-300 flex items-center gap-3"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </motion.button>
            </div>
          </motion.div>

          {/* Interactive Globe Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="relative mt-16"
          >
            <div className="w-80 h-80 mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full animate-pulse"></div>
              <div className="absolute inset-4 bg-gradient-to-br from-emerald-500/30 to-teal-500/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute inset-8 bg-gradient-to-br from-emerald-600/40 to-teal-600/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              
              {/* Floating Elements */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 bg-emerald-400 rounded-full"
                  style={{
                    top: `${20 + Math.sin(i * 0.8) * 30}%`,
                    left: `${20 + Math.cos(i * 0.8) * 30}%`,
                  }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
              
              <div className="absolute inset-0 flex items-center justify-center">
                <Globe className="w-16 h-16 text-emerald-600 animate-spin" style={{ animationDuration: '20s' }} />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              Why Choose GreenPOS?
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Revolutionizing rural commerce with blockchain technology and sustainable financing
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group"
              >
                <div className="bg-white/30 backdrop-blur-md border border-white/20 rounded-2xl p-8 h-full hover:bg-white/40 transition-all duration-300 shadow-lg hover:shadow-2xl">
                  <div className={`w-16 h-16 bg-gradient-to-br ${benefit.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-800 mb-4">{benefit.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              How It Works
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Four simple steps to transform your rural business
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`relative ${activeStep === index ? 'scale-105' : ''} transition-transform duration-500`}
              >
                <div className="bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl p-6 h-full hover:bg-white/50 transition-all duration-300 shadow-lg">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {index + 1}
                  </div>

                  {/* Step Image */}
                  <div className="w-full h-32 rounded-xl overflow-hidden mb-4 bg-gray-100">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Step Icon */}
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                    <step.icon className="w-6 h-6 text-white" />
                  </div>

                  <h4 className="text-xl font-bold text-gray-800 mb-3">{step.title}</h4>
                  <p className="text-gray-600">{step.description}</p>
                </div>

                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-emerald-300 to-teal-300 transform -translate-y-1/2">
                    <ChevronRight className="absolute -right-2 -top-2 w-4 h-4 text-emerald-500" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Spotlight */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
                Live Funding Rivers
              </h3>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Watch real-time money flows from investors to rural shops across Southeast Asia. 
                Our transparent blockchain network shows exactly where funding goes and how it impacts communities.
              </p>
              
              <div className="space-y-4">
                {[
                  "Real-time transaction visualization",
                  "Transparent fund allocation",
                  "Impact tracking and reporting",
                  "Community growth metrics"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl p-8 shadow-2xl">
                <div className="relative h-64 bg-white/50 rounded-xl overflow-hidden">
                  {/* Animated Flow Lines */}
                  <svg className="absolute inset-0 w-full h-full">
                    {[...Array(5)].map((_, i) => (
                      <motion.path
                        key={i}
                        d={`M ${20 + i * 60} 20 Q ${100 + i * 40} 120 ${200 + i * 30} 240`}
                        stroke="url(#gradient)"
                        strokeWidth="3"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.3,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#14B8A6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Floating Particles */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-emerald-400 rounded-full"
                      style={{
                        top: `${Math.random() * 80 + 10}%`,
                        left: `${Math.random() * 80 + 10}%`,
                      }}
                      animate={{
                        y: [0, -20, 0],
                        opacity: [0.3, 1, 0.3],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.4,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              Trusted by Leading Organizations
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join the growing network of impact investors and rural entrepreneurs
            </p>
          </motion.div>

          {/* Testimonial */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl p-8 mb-12 max-w-4xl mx-auto shadow-lg"
          >
            <div className="flex items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
            </div>
            <blockquote className="text-2xl text-gray-700 italic mb-6 leading-relaxed">
              "GreenPOS tripled our working capital in 2 weeks. The transparent funding process 
              and real-time analytics helped us scale our organic farm sustainably."
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-800">Siriporn Tantipong</p>
                <p className="text-gray-600">Green Valley Organic Farm, Thailand</p>
              </div>
            </div>
          </motion.div>

          {/* Partner Logos */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {partners.map((partner, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/30 backdrop-blur-md border border-white/20 rounded-xl p-6 flex items-center justify-center hover:bg-white/40 transition-all duration-300"
              >
                <span className="text-gray-600 font-medium text-center text-sm">{partner}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Ready to Join the Green Revolution?
            </h3>
            <p className="text-xl text-emerald-100 mb-12 leading-relaxed">
              Transform your rural business with blockchain-powered POS and micro-financing
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <motion.button
                onClick={onEnterApp}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group px-8 py-4 bg-white text-emerald-600 font-bold rounded-2xl shadow-2xl hover:shadow-white/25 transition-all duration-300 flex items-center gap-3"
              >
                <Store className="w-6 h-6" />
                Launch Your Shop
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group px-8 py-4 bg-white/20 backdrop-blur-md border border-white/30 text-white font-medium rounded-2xl hover:bg-white/30 transition-all duration-300 flex items-center gap-3"
              >
                <Users className="w-5 h-5" />
                Investor Portal
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">GreenPOS Network</h4>
                <p className="text-gray-400 text-sm">Sustainable Commerce Platform</p>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">
                © 2024 GreenPOS Network. Empowering rural communities.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Built on MASChain • SDG-9 Compliant
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};