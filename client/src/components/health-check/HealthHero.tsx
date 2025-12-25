"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function HealthHero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-violet-900 via-indigo-900 to-slate-900 py-20 lg:py-28">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 opacity-30">
         <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-violet-500 blur-3xl" />
         <div className="absolute top-1/2 left-1/2 h-64 w-64 rounded-full bg-indigo-400 blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
         <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-purple-600 blur-3xl" />
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgb3BhY2l0eT0iMC4wMyIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-violet-200 text-sm font-semibold mb-8 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Health Intelligence</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl mb-6"
          >
            Know Your Health <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-indigo-300">Better Than Ever</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10 text-lg text-violet-100/80 sm:text-xl max-w-2xl mx-auto"
          >
            Comprehensive health assessments powered by advanced algorithms. Check your stress levels, heart health, BMI, and get personalized wellness insights instantly.
          </motion.p>
          
          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-4 max-w-md mx-auto"
          >
            {[
              { value: "50K+", label: "Assessments" },
              { value: "98%", label: "Accuracy" },
              { value: "24/7", label: "Available" }
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-violet-200/70">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
