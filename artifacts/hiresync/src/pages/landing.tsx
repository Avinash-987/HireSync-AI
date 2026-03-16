import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  BrainCircuit, 
  Target, 
  LineChart, 
  Zap,
  TrendingUp,
  Star,
  LayoutList,
  Mail
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-2 rounded-xl text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl">HireSync AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:inline-flex">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-primary/20 border-0">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
                  <Sparkles className="w-4 h-4" />
                  <span>AI-Powered Job Search</span>
                </div>
                <h1 className="text-5xl lg:text-6xl font-display font-extrabold tracking-tight mb-6 leading-[1.1]">
                  Land Your Dream Job with <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-indigo-500">AI Intelligence</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Stop applying into the void. HireSync analyzes your resume, matches you with perfect roles, and optimizes your application for a 85% higher interview rate.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Link href="/register">
                    <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-base h-12 px-8 shadow-xl shadow-primary/20 border-0">
                      Start Your Search
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-background/50 backdrop-blur-sm border-white/10">
                      View Demo
                    </Button>
                  </Link>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative lg:h-[500px] hidden md:block"
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-violet-500/20 to-indigo-500/20 blur-[100px] -z-10 rounded-full" />
                
                {/* Mockup UI Cards */}
                <div className="glass-card rounded-2xl p-6 absolute top-10 right-0 w-[80%] z-20 border border-white/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-xl">S</div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">Senior Frontend Engineer</h3>
                        <p className="text-sm text-muted-foreground">Stripe • San Francisco (Hybrid)</p>
                      </div>
                    </div>
                    <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-sm font-bold border border-green-500/20 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      92% Match
                    </div>
                  </div>
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500" /> <span className="text-muted-foreground">React & TypeScript match</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500" /> <span className="text-muted-foreground">5+ years experience matches</span>
                    </div>
                  </div>
                  <Button className="w-full mt-6 bg-white/5 hover:bg-white/10 text-foreground border border-white/10">Apply with optimized resume</Button>
                </div>

                <div className="glass-card rounded-2xl p-6 absolute bottom-10 left-0 w-[70%] z-30 border border-white/10 backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/20 rounded-lg text-primary"><LineChart className="w-5 h-5" /></div>
                    <h3 className="font-semibold text-foreground">Resume ATS Score</h3>
                  </div>
                  <div className="flex items-end gap-4">
                    <div className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">88</div>
                    <div className="text-sm text-muted-foreground pb-1">/ 100 Excellent</div>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 w-[88%] rounded-full" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="border-y border-white/5 bg-white/[0.02]">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/5">
              <div>
                <div className="text-3xl font-display font-bold text-foreground mb-1">10K+</div>
                <div className="text-sm text-muted-foreground font-medium">Active Jobs</div>
              </div>
              <div>
                <div className="text-3xl font-display font-bold text-foreground mb-1">500+</div>
                <div className="text-sm text-muted-foreground font-medium">Top Companies</div>
              </div>
              <div>
                <div className="text-3xl font-display font-bold text-foreground mb-1">50K+</div>
                <div className="text-sm text-muted-foreground font-medium">Happy Users</div>
              </div>
              <div>
                <div className="text-3xl font-display font-bold text-primary mb-1">85%</div>
                <div className="text-sm text-muted-foreground font-medium">Interview Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Everything you need to get hired</h2>
            <p className="text-muted-foreground text-lg">Our AI-driven platform provides end-to-step tools to make your job search seamless and successful.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BrainCircuit, title: "AI Resume Analysis", desc: "Instantly see how ATS systems read your resume and get actionable tips to improve your score." },
              { icon: Target, title: "Smart Job Matching", desc: "Stop scrolling endlessly. Get curated matches based on your unique skills, experience, and preferences." },
              { icon: LayoutList, title: "Application Tracker", desc: "Manage all your applications in one beautiful kanban board. Never miss a follow-up." },
              { icon: TrendingUp, title: "Skill Gap Analysis", desc: "Identify missing skills for your target roles and get recommendations on what to learn next." },
              { icon: Zap, title: "One-Click Apply", desc: "Apply faster with auto-filled applications using your optimized profile and resumes." },
              { icon: Mail, title: "Real-time Alerts", desc: "Be the first to know when a high-matching job is posted in your desired location or remote." }
            ].map((feature, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl border border-white/5 hover:bg-white/[0.02] transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-24 bg-card/30 border-y border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-16 text-center">Loved by ambitious professionals</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: "Sarah J.", role: "Product Designer", quote: "HireSync found jobs I couldn't find on LinkedIn. The AI resume suggestions helped me increase my ATS score from 45 to 92. Landed a job in 3 weeks!" },
                { name: "Michael T.", role: "Data Scientist", quote: "The match percentage is incredibly accurate. I stopped applying to jobs under 70% match and my interview rate skyrocketed. Best investment." },
                { name: "Emily R.", role: "Marketing Manager", quote: "I love the application tracker. It completely replaced my messy spreadsheets. The UI is gorgeous and makes job hunting actually enjoyable." }
              ].map((testimonial, i) => (
                <div key={i} className="glass-card p-8 rounded-2xl relative">
                  <div className="flex gap-1 text-yellow-500 mb-4">
                    {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="text-muted-foreground mb-6 text-lg italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto glass-panel p-12 rounded-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 -z-10" />
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-foreground">Ready to accelerate your career?</h2>
            <p className="text-lg text-muted-foreground mb-8">Join thousands of professionals who are getting hired faster with AI.</p>
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 h-14 px-10 text-lg shadow-xl shadow-primary/25 hover:scale-105 transition-transform">
                Create Free Account
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-12 bg-background">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-display font-bold">HireSync AI</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 HireSync AI. All rights reserved.</p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
